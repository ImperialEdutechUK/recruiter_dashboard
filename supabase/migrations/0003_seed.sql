-- =====================================================================
-- Seed data: brands, document checklist templates (§9), induction tasks
-- =====================================================================

insert into brands (slug, name, color) values
  ('slc',     'South London College', '#0D1B2A'),
  ('aspirex', 'Aspirex',              '#B34700'),
  ('edulink', 'Global Edulink',       '#1B6B2E')
on conflict (slug) do nothing;

-- ---- Universal documents (all roles) — applies_to = null ------------
insert into document_templates (applies_to, label, sort_order) values
  (null, 'Proof of ID (Passport or Driving Licence)', 10),
  (null, 'Proof of Right to Work in the UK', 20),
  (null, 'Enhanced DBS Check (within 3 years, or Update Service subscription)', 30),
  (null, 'CV (most recent version)', 40),
  (null, 'Two professional references (contact details)', 50);

-- ---- Tutor ----------------------------------------------------------
insert into document_templates (applies_to, label, sort_order) values
  ('tutor', 'Subject qualification (minimum Level 3 or equivalent)', 100),
  ('tutor', 'Teaching/training qualification (PGCE, CertEd, AET, PTLLS or equivalent)', 110),
  ('tutor', 'Evidence of CPD (last 12 months)', 120),
  ('tutor', 'Industry experience evidence', 130);

-- ---- Assessor -------------------------------------------------------
insert into document_templates (applies_to, label, sort_order) values
  ('assessor', 'Subject qualification (minimum Level 3)', 100),
  ('assessor', 'Assessor qualification (TAQA, A1, D32/D33 or equivalent)', 110),
  ('assessor', 'Teaching/training qualification', 120),
  ('assessor', 'Evidence of CPD (last 12 months)', 130);

-- ---- IQA Tutor ------------------------------------------------------
insert into document_templates (applies_to, label, sort_order) values
  ('iqa_tutor', 'Subject qualification (minimum Level 3)', 100),
  ('iqa_tutor', 'IQA qualification (TAQA Level 4, V1, D34 or equivalent)', 110),
  ('iqa_tutor', 'Assessor qualification (TAQA, A1, D32/D33 or equivalent)', 120),
  ('iqa_tutor', 'Teaching/training qualification', 130),
  ('iqa_tutor', 'Evidence of CPD (last 12 months)', 140);

-- ---- Webinar Moderator ----------------------------------------------
insert into document_templates (applies_to, label, sort_order) values
  ('webinar_moderator', 'Subject knowledge evidence', 100),
  ('webinar_moderator', 'Evidence of online/remote delivery experience', 110),
  ('webinar_moderator', 'Platform familiarity declaration (Zoom, Teams, Adobe Connect)', 120);

-- ---- Webinar Tutor --------------------------------------------------
insert into document_templates (applies_to, label, sort_order) values
  ('webinar_tutor', 'Subject qualification (minimum Level 3)', 100),
  ('webinar_tutor', 'Evidence of online/remote delivery experience', 110),
  ('webinar_tutor', 'Platform familiarity declaration', 120),
  ('webinar_tutor', 'Teaching/training qualification', 130);

-- ---- Video Presenter ------------------------------------------------
insert into document_templates (applies_to, label, sort_order) values
  ('video_presenter', 'Showreel or sample video (link or uploaded file)', 100),
  ('video_presenter', 'Subject matter expertise evidence', 110);

-- ---- Default induction tasks ----------------------------------------
insert into induction_templates (label, sort_order) values
  ('Send welcome email and staff handbook', 10),
  ('Set up LMS / portal account', 20),
  ('Assign initial programmes and groups', 30),
  ('Schedule platform / systems walkthrough', 40),
  ('Confirm payroll and invoicing details received', 50),
  ('Add to relevant Teams channels', 60);
