-- CreateTable
CREATE TABLE "_ProjectManagers" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ProjectManagers_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ProjectManagers_B_index" ON "_ProjectManagers"("B");

-- AddForeignKey
ALTER TABLE "_ProjectManagers" ADD CONSTRAINT "_ProjectManagers_A_fkey" FOREIGN KEY ("A") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProjectManagers" ADD CONSTRAINT "_ProjectManagers_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
