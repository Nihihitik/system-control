-- CreateTable
CREATE TABLE "_ProjectEngineers" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ProjectEngineers_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ProjectEngineers_B_index" ON "_ProjectEngineers"("B");

-- AddForeignKey
ALTER TABLE "_ProjectEngineers" ADD CONSTRAINT "_ProjectEngineers_A_fkey" FOREIGN KEY ("A") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProjectEngineers" ADD CONSTRAINT "_ProjectEngineers_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
