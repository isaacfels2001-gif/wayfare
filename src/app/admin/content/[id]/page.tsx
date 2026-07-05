import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { ContentForm } from "@/components/admin/ContentForm";
import { updateContentAction } from "@/lib/actions/admin/content";

export default async function EditContentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const page = await prisma.contentPage.findUnique({ where: { id } });
  if (!page) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Edit CMS page</h1>
      <div className="mt-6">
        <ContentForm action={updateContentAction} defaults={page} />
      </div>
    </div>
  );
}
