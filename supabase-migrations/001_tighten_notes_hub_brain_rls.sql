-- Migration: tighten RLS on notes and hub_brain
-- Applied: 2026-03-15
-- Reason: Both tables had policies with qual = true, allowing anonymous access

-- notes — was "Allow all for now" = true (anyone could read/write/delete all notes)
DROP POLICY IF EXISTS "Allow all for now" ON notes;
CREATE POLICY "authenticated_only" ON notes
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- hub_brain — was "Allow all for anon" = true (fully public knowledge base)
DROP POLICY IF EXISTS "Allow all for anon" ON hub_brain;
CREATE POLICY "authenticated_only" ON hub_brain
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
