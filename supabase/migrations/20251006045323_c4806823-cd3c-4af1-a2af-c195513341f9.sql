-- Drop problematic policies
DROP POLICY IF EXISTS "Users can view projects they are members of" ON public.projects;
DROP POLICY IF EXISTS "Users can view members of their projects" ON public.project_members;
DROP POLICY IF EXISTS "Project owners and admins can add members" ON public.project_members;
DROP POLICY IF EXISTS "Project owners and admins can update members" ON public.project_members;
DROP POLICY IF EXISTS "Project owners and admins can remove members" ON public.project_members;

-- Recreate projects SELECT policy (simpler, no recursion)
CREATE POLICY "Users can view their own projects and projects they are members of"
  ON public.projects FOR SELECT
  USING (
    auth.uid() = owner_id OR
    EXISTS (
      SELECT 1 FROM public.project_members
      WHERE project_members.project_id = projects.id
        AND project_members.user_id = auth.uid()
    )
  );

-- Recreate project_members policies (simpler, avoid recursion)
CREATE POLICY "Users can view project members if they are members or owners"
  ON public.project_members FOR SELECT
  USING (
    -- User is viewing themselves as a member
    project_members.user_id = auth.uid() OR
    -- User is the project owner
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = project_members.project_id
        AND projects.owner_id = auth.uid()
    ) OR
    -- User is also a member of the same project
    EXISTS (
      SELECT 1 FROM public.project_members pm
      WHERE pm.project_id = project_members.project_id
        AND pm.user_id = auth.uid()
    )
  );

CREATE POLICY "Project owners can add members"
  ON public.project_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = project_members.project_id
        AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY "Project owners can update members"
  ON public.project_members FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = project_members.project_id
        AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY "Project owners can remove members"
  ON public.project_members FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = project_members.project_id
        AND projects.owner_id = auth.uid()
    )
  );