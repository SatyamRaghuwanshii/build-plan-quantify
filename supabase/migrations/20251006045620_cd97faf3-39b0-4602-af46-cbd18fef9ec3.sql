-- Create helper functions to avoid RLS recursion
CREATE OR REPLACE FUNCTION public.is_project_member(_user_id uuid, _project_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.project_members
    WHERE user_id = _user_id AND project_id = _project_id
  );
$$;

CREATE OR REPLACE FUNCTION public.is_project_owner(_user_id uuid, _project_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.projects
    WHERE id = _project_id AND owner_id = _user_id
  );
$$;

-- Replace projects SELECT policy to use helper function
DROP POLICY IF EXISTS "Users can view their own projects and projects they are members of" ON public.projects;
CREATE POLICY "Projects selectable by owner or member"
  ON public.projects FOR SELECT
  USING (
    auth.uid() = owner_id OR public.is_project_member(auth.uid(), id)
  );

-- Replace project_members policies to use helper functions and avoid cross-table SELECTs
DROP POLICY IF EXISTS "Users can view project members if they are members or owners" ON public.project_members;
DROP POLICY IF EXISTS "Project owners can add members" ON public.project_members;
DROP POLICY IF EXISTS "Project owners can update members" ON public.project_members;
DROP POLICY IF EXISTS "Project owners can remove members" ON public.project_members;

CREATE POLICY "View project_members if owner, member, or self"
  ON public.project_members FOR SELECT
  USING (
    project_members.user_id = auth.uid() OR
    public.is_project_owner(auth.uid(), project_id) OR
    public.is_project_member(auth.uid(), project_id)
  );

CREATE POLICY "Only owners can add members"
  ON public.project_members FOR INSERT
  WITH CHECK (public.is_project_owner(auth.uid(), project_id));

CREATE POLICY "Only owners can update members"
  ON public.project_members FOR UPDATE
  USING (public.is_project_owner(auth.uid(), project_id));

CREATE POLICY "Only owners can remove members"
  ON public.project_members FOR DELETE
  USING (public.is_project_owner(auth.uid(), project_id));