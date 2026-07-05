import Link from "next/link";
import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/Badge";
import { LinkButton } from "@/components/ui/Button";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { deleteContentAction } from "@/lib/actions/admin/content";

export default async function AdminContentPage() {
  const pages = await prisma.contentPage.findMany({ orderBy: { title: "asc" } });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">CMS pages</h1>
        <LinkButton href="/admin/content/new">Add page</LinkButton>
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-2.5">Title</th>
              <th className="px-4 py-2.5">Slug</th>
              <th className="px-4 py-2.5">Status</th>
              <th className="px-4 py-2.5" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {pages.map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-2.5 font-medium text-slate-900">{p.title}</td>
                <td className="px-4 py-2.5 font-mono text-xs text-slate-500">/destinations/{p.slug}</td>
                <td className="px-4 py-2.5">
                  <Badge tone={p.published ? "green" : "slate"}>{p.published ? "published" : "draft"}</Badge>
                </td>
                <td className="px-4 py-2.5 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <Link href={`/admin/content/${p.id}`} className="text-xs font-medium text-blue-600 hover:text-blue-700">
                      Edit
                    </Link>
                    <form action={deleteContentAction}>
                      <input type="hidden" name="id" value={p.id} />
                      <DeleteButton />
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
