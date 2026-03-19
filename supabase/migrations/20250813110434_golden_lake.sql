@@ .. @@
 -- Enable RLS on team_ai_config
 alter table public.team_ai_config enable row level security;
 
--- Create RLS policies for team_ai_config
-do $$
-begin
-  if not exists (
-    select 1 from pg_policies
-    where schemaname='public'
-      and tablename='team_ai_config'
-      and policyname='Team members can read AI config'
-  ) then
-    create policy "Team members can read AI config" on public.team_ai_config
-      for select using (
-        exists (
-          select 1 from public.team_members tm
-          where tm.team_id = team_ai_config.team_id
-            and tm.user_id = auth.uid()
-        )
-      );
-  end if;
-
-  if not exists (
-    select 1 from pg_policies
-    where schemaname='public'
-      and tablename='team_ai_config'
-      and policyname='Team members can write AI config'
-  ) then
-    create policy "Team members can write AI config" on public.team_ai_config
-      for insert with check (
-        exists (
-          select 1 from public.team_members tm
-          where tm.team_id = team_ai_config.team_id
-            and tm.user_id = auth.uid()
-        )
-      );
-  end if;
-end $$;
+do $$
+begin
+  begin
+    create policy "Team members can read AI config" on public.team_ai_config
+      for select using (
+        exists (
+          select 1 from public.team_members tm
+          where tm.team_id = team_ai_config.team_id
+            and tm.user_id = auth.uid()
+        )
+      );
+  exception when duplicate_object then
+    null;
+  end;
+
+  begin
+    create policy "Team members can write AI config" on public.team_ai_config
+      for insert with check (
+        exists (
+          select 1 from public.team_members tm
+          where tm.team_id = team_ai_config.team_id
+            and tm.user_id = auth.uid()
+        )
+      );
+  exception when duplicate_object then
+    null;
+  end;
+end $$;
 
 -- Enable RLS on chat_threads