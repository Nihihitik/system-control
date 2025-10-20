-- CreateTable for additional assignees many-to-many
CREATE TABLE "defect_additional_assignees" (
  "defect_id" INTEGER NOT NULL,
  "user_id" INTEGER NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "defect_additional_assignees_pkey" PRIMARY KEY ("defect_id", "user_id")
);

-- Foreign keys
ALTER TABLE "defect_additional_assignees"
  ADD CONSTRAINT "defect_additional_assignees_defect_id_fkey"
  FOREIGN KEY ("defect_id") REFERENCES "defects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "defect_additional_assignees"
  ADD CONSTRAINT "defect_additional_assignees_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;