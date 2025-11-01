import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// IFC element types to extract
const IFC_ELEMENT_TYPES = [
  'IfcWall',
  'IfcSlab',
  'IfcBeam',
  'IfcColumn',
  'IfcDoor',
  'IfcWindow',
  'IfcStair',
  'IfcRoof',
  'IfcFooting',
  'IfcCovering',
  'IfcRailing',
];

// Parse basic IFC metadata from file content
function parseIfcMetadata(ifcContent: string): {
  schema: string;
  projectName: string;
  description: string;
  elementCount: number;
} {
  let schema = 'UNKNOWN';
  let projectName = 'Untitled Project';
  let description = '';
  let elementCount = 0;

  // Extract IFC schema version
  const schemaMatch = ifcContent.match(/FILE_SCHEMA\s*\(\s*\('([^']+)'\)/);
  if (schemaMatch) {
    schema = schemaMatch[1];
  }

  // Extract project name
  const projectMatch = ifcContent.match(/IFCPROJECT\([^,]*,\s*[^,]*,\s*'([^']+)'/);
  if (projectMatch) {
    projectName = projectMatch[1];
  }

  // Extract project description
  const descMatch = ifcContent.match(/IFCPROJECT\([^,]*,\s*[^,]*,\s*'[^']+',\s*'([^']+)'/);
  if (descMatch) {
    description = descMatch[1];
  }

  // Count elements
  IFC_ELEMENT_TYPES.forEach((elementType) => {
    const regex = new RegExp(elementType.toUpperCase(), 'g');
    const matches = ifcContent.match(regex);
    if (matches) {
      elementCount += matches.length;
    }
  });

  return { schema, projectName, description, elementCount };
}

// Extract IFC elements with basic properties
function extractIfcElements(ifcContent: string): Array<{
  ifcId: string;
  elementType: string;
  elementName: string;
  materialType: string;
  properties: Record<string, any>;
}> {
  const elements: Array<{
    ifcId: string;
    elementType: string;
    elementName: string;
    materialType: string;
    properties: Record<string, any>;
  }> = [];

  // This is a simplified parser. In production, use a proper IFC library like web-ifc
  IFC_ELEMENT_TYPES.forEach((elementType) => {
    const regex = new RegExp(
      `#(\\d+)\\s*=\\s*${elementType.toUpperCase()}\\(([^;]+)\\);`,
      'g'
    );
    let match;

    while ((match = regex.exec(ifcContent)) !== null) {
      const ifcId = match[1];
      const params = match[2];

      // Extract name from parameters (usually the third parameter)
      let elementName = `${elementType}_${ifcId}`;
      const nameMatch = params.match(/'([^']+)'/);
      if (nameMatch) {
        elementName = nameMatch[1];
      }

      // Determine material type based on element type and name
      let materialType = 'Unknown';
      if (elementName.toLowerCase().includes('concrete') || elementType === 'IfcSlab') {
        materialType = 'Concrete';
      } else if (elementName.toLowerCase().includes('steel') || elementType === 'IfcBeam') {
        materialType = 'Steel';
      } else if (elementName.toLowerCase().includes('brick')) {
        materialType = 'Brick';
      } else if (elementType === 'IfcWall') {
        materialType = 'Masonry';
      } else if (elementType === 'IfcDoor' || elementType === 'IfcWindow') {
        materialType = 'Wood';
      }

      elements.push({
        ifcId: `#${ifcId}`,
        elementType: elementType.replace('Ifc', ''),
        elementName,
        materialType,
        properties: {
          rawParams: params,
        },
      });

      // Limit to prevent memory issues
      if (elements.length >= 10000) {
        break;
      }
    }
  });

  return elements;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const startTime = Date.now();

    // Get Supabase credentials from environment
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase credentials');
    }

    // Create Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request payload
    const { storage_path, project_id, file_name } = await req.json();

    if (!storage_path || !project_id || !file_name) {
      throw new Error('Missing required parameters: storage_path, project_id, file_name');
    }

    console.log(`Processing IFC file: ${file_name}`);

    // Download IFC file from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('bim-models')
      .download(storage_path);

    if (downloadError || !fileData) {
      console.error('Failed to download IFC file:', downloadError);
      throw new Error('Failed to download IFC file from storage');
    }

    // Get file size
    const fileSize = fileData.size;

    // Check file size limit (100MB)
    if (fileSize > 104857600) {
      return new Response(
        JSON.stringify({ error: 'File exceeds maximum size of 100MB' }),
        {
          status: 413,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Read file content as text
    const ifcContent = await fileData.text();

    // Basic validation - check if it's an IFC file
    if (!ifcContent.includes('ISO-10303-21') || !ifcContent.includes('IFCPROJECT')) {
      return new Response(
        JSON.stringify({ error: 'Invalid IFC file format' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('Parsing IFC metadata...');

    // Parse IFC metadata
    const metadata = parseIfcMetadata(ifcContent);

    console.log(`Found ${metadata.elementCount} elements`);
    console.log('Extracting IFC elements...');

    // Extract elements
    const elements = extractIfcElements(ifcContent);

    console.log(`Extracted ${elements.length} elements`);

    // Create BIM model record
    const { data: bimModel, error: modelError } = await supabase
      .from('bim_models')
      .insert({
        project_id,
        file_name,
        storage_path,
        file_size: fileSize,
        ifc_schema: metadata.schema,
        project_name: metadata.projectName,
        element_count: elements.length,
        metadata: {
          description: metadata.description,
          totalElementsFound: metadata.elementCount,
          processedElements: elements.length,
        },
        uploaded_by: req.headers.get('x-user-id') || null,
      })
      .select()
      .single();

    if (modelError) {
      console.error('Failed to create BIM model record:', modelError);
      throw new Error('Failed to create BIM model record');
    }

    console.log(`Created BIM model record: ${bimModel.id}`);

    // Insert elements in batches (Supabase has a limit on bulk inserts)
    const BATCH_SIZE = 500;
    let insertedCount = 0;

    for (let i = 0; i < elements.length; i += BATCH_SIZE) {
      const batch = elements.slice(i, i + BATCH_SIZE);

      const elementsToInsert = batch.map((el) => ({
        bim_model_id: bimModel.id,
        ifc_id: el.ifcId,
        element_type: el.elementType,
        element_name: el.elementName,
        material_type: el.materialType,
        properties: el.properties,
        // Note: volume, area, length require proper IFC geometry parsing
        // For production, integrate with web-ifc library
        volume: null,
        area: null,
        length: null,
      }));

      const { error: elementsError } = await supabase
        .from('bim_elements')
        .insert(elementsToInsert);

      if (elementsError) {
        console.error('Failed to insert elements batch:', elementsError);
        // Continue with next batch instead of failing completely
      } else {
        insertedCount += batch.length;
      }
    }

    console.log(`Inserted ${insertedCount} elements`);

    // Update project's primary BIM model URL if this is the first model
    const { data: existingModels, error: modelsError } = await supabase
      .from('bim_models')
      .select('id')
      .eq('project_id', project_id)
      .order('created_at', { ascending: true })
      .limit(1);

    if (!modelsError && existingModels && existingModels.length > 0) {
      if (existingModels[0].id === bimModel.id) {
        // This is the first model, set as primary
        await supabase
          .from('projects')
          .update({ primary_bim_model_url: storage_path })
          .eq('id', project_id);

        console.log('Set as primary BIM model for project');
      }
    }

    const processingTime = Date.now() - startTime;

    return new Response(
      JSON.stringify({
        success: true,
        bim_model_id: bimModel.id,
        element_count: insertedCount,
        processing_time_ms: processingTime,
        metadata: {
          schema: metadata.schema,
          projectName: metadata.projectName,
          totalElements: metadata.elementCount,
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in process-ifc-file function:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
