-- CreateTable
CREATE TABLE "_ProjectObservers" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ProjectObservers_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ProjectObservers_B_index" ON "_ProjectObservers"("B");

-- AddForeignKey
ALTER TABLE "_ProjectObservers" ADD CONSTRAINT "_ProjectObservers_A_fkey" FOREIGN KEY ("A") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProjectObservers" ADD CONSTRAINT "_ProjectObservers_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
