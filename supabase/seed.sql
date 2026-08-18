-- Seed: Badges
INSERT INTO public.badges (slug, name, description, icon, criteria, is_manual) VALUES
  ('first-build',     'First Build',         'Complete your first workshop project',              '🔨', '{"type":"project_count","count":1}',         false),
  ('regular',         'Regular',             'Attend 5 events in a season',                      '📅', '{"type":"attendance_count","count":5}',      false),
  ('perfect-season',  'Perfect Attendance',  'Attend every event in a season',                   '⭐', '{"type":"perfect_attendance"}',              false),
  ('builder',         'Builder',             'Complete 5 projects',                              '🏗️', '{"type":"project_count","count":5}',         false),
  ('speedrunner',     'Speedrunner',         'Finish a challenge in top 10% of submissions',     '⚡', '{"type":"top_submission_percent","pct":10}', false),
  ('top-10',          'Top 10',              'Reach top 10 on the leaderboard',                  '🏆', '{"type":"leaderboard_rank","rank":10}',      false),
  ('champion',        'Champion',            'Finish #1 at end of season',                       '👑', '{"type":"season_rank","rank":1}',            false),
  ('streak-3',        '3-Event Streak',      'Attend 3 consecutive events',                      '🔥', '{"type":"streak","count":3}',               false),
  ('streak-5',        '5-Event Streak',      'Attend 5 consecutive events',                      '🌟', '{"type":"streak","count":5}',               false),
  ('volunteer',       'Volunteer',           'Earn volunteer points in a season',                '🤝', '{"type":"volunteer_points"}',               true);

-- Seed: Active season
INSERT INTO public.seasons (name, slug, start_date, end_date, is_active) VALUES
  ('VOLT League 2026', '2026', '2026-01-01', '2026-12-31', true);
