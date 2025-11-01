import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Email template generator
function generateEmailContent(eventType: string, eventData: any): { subject: string; html: string; text: string } {
  switch (eventType) {
    case 'bid_received':
      return {
        subject: `New Bid Received: ${eventData.bidRequestTitle}`,
        html: `
          <h2>New Bid Received</h2>
          <p>You have received a new bid on your request: <strong>${eventData.bidRequestTitle}</strong></p>
          <h3>Bid Details:</h3>
          <ul>
            <li><strong>Vendor:</strong> ${eventData.vendorName}</li>
            <li><strong>Price:</strong> $${eventData.price}</li>
            <li><strong>Delivery Time:</strong> ${eventData.deliveryTimeDays} days</li>
            <li><strong>Notes:</strong> ${eventData.notes || 'None'}</li>
          </ul>
          <p><a href="${eventData.projectUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Bid</a></p>
          <hr>
          <p style="color: #888; font-size: 12px;">You received this email because you have email notifications enabled for bidding updates.</p>
        `,
        text: `New Bid Received\n\nYou have received a new bid on your request: ${eventData.bidRequestTitle}\n\nBid Details:\n- Vendor: ${eventData.vendorName}\n- Price: $${eventData.price}\n- Delivery Time: ${eventData.deliveryTimeDays} days\n- Notes: ${eventData.notes || 'None'}\n\nView bid: ${eventData.projectUrl}\n\nYou received this email because you have email notifications enabled for bidding updates.`,
      };

    case 'task_assigned':
      return {
        subject: `Task Assigned: ${eventData.taskTitle}`,
        html: `
          <h2>New Task Assigned</h2>
          <p>You have been assigned a new task: <strong>${eventData.taskTitle}</strong></p>
          <h3>Task Details:</h3>
          <ul>
            <li><strong>Project:</strong> ${eventData.projectName}</li>
            <li><strong>Description:</strong> ${eventData.taskDescription || 'No description'}</li>
            <li><strong>Priority:</strong> ${eventData.priority}</li>
            <li><strong>Due Date:</strong> ${eventData.dueDate ? new Date(eventData.dueDate).toLocaleDateString() : 'No due date'}</li>
            <li><strong>Assigned by:</strong> ${eventData.assignedByName}</li>
          </ul>
          <p><a href="${eventData.projectUrl}" style="background-color: #2196F3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Task</a></p>
          <hr>
          <p style="color: #888; font-size: 12px;">You received this email because you have email notifications enabled for task updates.</p>
        `,
        text: `New Task Assigned\n\nYou have been assigned a new task: ${eventData.taskTitle}\n\nTask Details:\n- Project: ${eventData.projectName}\n- Description: ${eventData.taskDescription || 'No description'}\n- Priority: ${eventData.priority}\n- Due Date: ${eventData.dueDate ? new Date(eventData.dueDate).toLocaleDateString() : 'No due date'}\n- Assigned by: ${eventData.assignedByName}\n\nView task: ${eventData.projectUrl}\n\nYou received this email because you have email notifications enabled for task updates.`,
      };

    case 'task_reassigned':
      return {
        subject: `Task Reassigned: ${eventData.taskTitle}`,
        html: `
          <h2>Task Reassigned to You</h2>
          <p>A task has been reassigned to you: <strong>${eventData.taskTitle}</strong></p>
          <h3>Task Details:</h3>
          <ul>
            <li><strong>Project:</strong> ${eventData.projectName}</li>
            <li><strong>Description:</strong> ${eventData.taskDescription || 'No description'}</li>
            <li><strong>Priority:</strong> ${eventData.priority}</li>
            <li><strong>Due Date:</strong> ${eventData.dueDate ? new Date(eventData.dueDate).toLocaleDateString() : 'No due date'}</li>
          </ul>
          <p><a href="${eventData.projectUrl}" style="background-color: #2196F3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Task</a></p>
          <hr>
          <p style="color: #888; font-size: 12px;">You received this email because you have email notifications enabled for task updates.</p>
        `,
        text: `Task Reassigned to You\n\nA task has been reassigned to you: ${eventData.taskTitle}\n\nTask Details:\n- Project: ${eventData.projectName}\n- Description: ${eventData.taskDescription || 'No description'}\n- Priority: ${eventData.priority}\n- Due Date: ${eventData.dueDate ? new Date(eventData.dueDate).toLocaleDateString() : 'No due date'}\n\nView task: ${eventData.projectUrl}\n\nYou received this email because you have email notifications enabled for task updates.`,
      };

    case 'project_member_added':
      return {
        subject: `Added to Project: ${eventData.projectName}`,
        html: `
          <h2>Added to Project</h2>
          <p>You have been added as a member to the project: <strong>${eventData.projectName}</strong></p>
          <h3>Project Details:</h3>
          <ul>
            <li><strong>Project Type:</strong> ${eventData.projectType}</li>
            <li><strong>Status:</strong> ${eventData.projectStatus}</li>
            <li><strong>Owner:</strong> ${eventData.ownerName}</li>
            <li><strong>Your Role:</strong> ${eventData.memberRole}</li>
          </ul>
          <p><a href="${eventData.projectUrl}" style="background-color: #FF9800; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Project</a></p>
          <hr>
          <p style="color: #888; font-size: 12px;">You received this email because you have email notifications enabled for project updates.</p>
        `,
        text: `Added to Project\n\nYou have been added as a member to the project: ${eventData.projectName}\n\nProject Details:\n- Project Type: ${eventData.projectType}\n- Status: ${eventData.projectStatus}\n- Owner: ${eventData.ownerName}\n- Your Role: ${eventData.memberRole}\n\nView project: ${eventData.projectUrl}\n\nYou received this email because you have email notifications enabled for project updates.`,
      };

    default:
      return {
        subject: 'Notification from Build Plan Quantify',
        html: `<p>You have a new notification.</p>`,
        text: 'You have a new notification.',
      };
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get Supabase credentials from environment
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase credentials');
    }

    // Create Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse webhook payload (from database webhooks)
    const { type, table, record, old_record } = await req.json();

    console.log(`Processing ${type} event on ${table} table`);

    // Determine event type and recipient
    let eventType = '';
    let recipientUserId = '';
    let eventData: any = {};

    // Handle different table events
    if (table === 'bids' && type === 'INSERT') {
      eventType = 'bid_received';

      // Get bid request and owner details
      const { data: bidRequest } = await supabase
        .from('bid_requests')
        .select('user_id, title, description, project_id')
        .eq('id', record.bid_request_id)
        .single();

      if (!bidRequest) {
        console.log('Bid request not found');
        return new Response(JSON.stringify({ skipped: true, reason: 'Bid request not found' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      recipientUserId = bidRequest.user_id;

      // Get vendor details
      const { data: vendor } = await supabase
        .from('vendor_profiles')
        .select('company_name')
        .eq('id', record.vendor_id)
        .single();

      eventData = {
        bidRequestTitle: bidRequest.title,
        vendorName: vendor?.company_name || 'Unknown Vendor',
        price: record.price,
        deliveryTimeDays: record.delivery_time_days,
        notes: record.notes,
        projectUrl: `${supabaseUrl.replace('.supabase.co', '')}/project/${bidRequest.project_id}`,
      };
    } else if (table === 'tasks' && type === 'INSERT' && record.assigned_to) {
      eventType = 'task_assigned';
      recipientUserId = record.assigned_to;

      // Get project details
      const { data: project } = await supabase
        .from('projects')
        .select('name, owner_id')
        .eq('id', record.project_id)
        .single();

      // Get assigner details (project owner)
      const { data: owner } = await supabase
        .from('auth.users')
        .select('email')
        .eq('id', project?.owner_id)
        .single();

      eventData = {
        taskTitle: record.title,
        taskDescription: record.description,
        priority: record.priority || 'medium',
        dueDate: record.due_date,
        projectName: project?.name || 'Unknown Project',
        assignedByName: owner?.email || 'Project Owner',
        projectUrl: `${supabaseUrl.replace('.supabase.co', '')}/project/${record.project_id}`,
      };
    } else if (
      table === 'tasks' &&
      type === 'UPDATE' &&
      record.assigned_to !== old_record.assigned_to &&
      record.assigned_to
    ) {
      eventType = 'task_reassigned';
      recipientUserId = record.assigned_to;

      // Get project details
      const { data: project } = await supabase
        .from('projects')
        .select('name')
        .eq('id', record.project_id)
        .single();

      eventData = {
        taskTitle: record.title,
        taskDescription: record.description,
        priority: record.priority || 'medium',
        dueDate: record.due_date,
        projectName: project?.name || 'Unknown Project',
        projectUrl: `${supabaseUrl.replace('.supabase.co', '')}/project/${record.project_id}`,
      };
    } else if (table === 'project_members' && type === 'INSERT') {
      eventType = 'project_member_added';
      recipientUserId = record.user_id;

      // Get project details
      const { data: project } = await supabase
        .from('projects')
        .select('name, type, status, owner_id')
        .eq('id', record.project_id)
        .single();

      // Get owner details
      const { data: owner } = await supabase
        .from('auth.users')
        .select('email')
        .eq('id', project?.owner_id)
        .single();

      eventData = {
        projectName: project?.name || 'Unknown Project',
        projectType: project?.type || 'Unknown',
        projectStatus: project?.status || 'Unknown',
        ownerName: owner?.email || 'Project Owner',
        memberRole: record.role || 'member',
        projectUrl: `${supabaseUrl.replace('.supabase.co', '')}/project/${record.project_id}`,
      };
    } else {
      console.log('Event not handled:', type, table);
      return new Response(JSON.stringify({ skipped: true, reason: 'Event not handled' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get recipient user details
    const { data: recipientUser, error: userError } = await supabase.auth.admin.getUserById(
      recipientUserId
    );

    if (userError || !recipientUser?.user) {
      console.error('Failed to get recipient user:', userError);
      return new Response(JSON.stringify({ error: 'Recipient user not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const recipientEmail = recipientUser.user.email;

    if (!recipientEmail) {
      console.log('Recipient has no email');
      return new Response(JSON.stringify({ skipped: true, reason: 'No email' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check user preferences for email notifications
    const { data: preferences } = await supabase
      .from('user_preferences')
      .select('email_notifications, email_bidding_updates, email_task_updates, email_project_updates')
      .eq('user_id', recipientUserId)
      .single();

    // If no preferences exist, create default preferences
    if (!preferences) {
      await supabase.from('user_preferences').insert({
        user_id: recipientUserId,
        email_notifications: true,
        email_bidding_updates: true,
        email_task_updates: true,
        email_project_updates: true,
      });
    }

    // Check if email notifications are enabled for this event category
    const emailEnabled = preferences?.email_notifications ?? true;
    let categoryEnabled = true;

    if (eventType === 'bid_received') {
      categoryEnabled = preferences?.email_bidding_updates ?? true;
    } else if (eventType === 'task_assigned' || eventType === 'task_reassigned') {
      categoryEnabled = preferences?.email_task_updates ?? true;
    } else if (eventType === 'project_member_added') {
      categoryEnabled = preferences?.email_project_updates ?? true;
    }

    if (!emailEnabled || !categoryEnabled) {
      console.log('Email notifications disabled for user');
      return new Response(
        JSON.stringify({ skipped: true, reason: 'Email notifications disabled' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Generate email content
    const emailContent = generateEmailContent(eventType, eventData);

    // Send email using Supabase Auth (currently uses generic email, but can be enhanced with SMTP)
    // Note: Supabase doesn't have a built-in email sending API beyond auth emails
    // For production, integrate with SendGrid, Resend, or similar service
    console.log(`Would send email to ${recipientEmail}:`);
    console.log(`Subject: ${emailContent.subject}`);
    console.log(`Content: ${emailContent.text}`);

    // TODO: Integrate with actual email service (SendGrid, Resend, AWS SES, etc.)
    // Example with Resend (requires RESEND_API_KEY environment variable):
    /*
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (resendApiKey) {
      const emailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Build Plan Quantify <notifications@buildplanquantify.com>',
          to: recipientEmail,
          subject: emailContent.subject,
          html: emailContent.html,
        }),
      });

      if (!emailResponse.ok) {
        throw new Error(`Failed to send email: ${await emailResponse.text()}`);
      }
    }
    */

    return new Response(
      JSON.stringify({
        success: true,
        eventType,
        recipient: recipientEmail,
        message: 'Notification processed (email sending not configured)',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in send-notification-email function:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
