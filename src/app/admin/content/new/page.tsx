import { ContentForm } from "@/components/admin/ContentForm";
import { createContentAction } from "@/lib/actions/admin/content";

export default function NewContentPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Add CMS page</h1>
      <div className="mt-6">
        <ContentForm action={createContentAction} defaults={{}} />
      </div>
    </div>
  );
}
