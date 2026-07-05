import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";

export interface ContentDefaults {
  id?: string;
  slug?: string;
  title?: string;
  heroImage?: string;
  bodyMarkdown?: string;
  published?: boolean;
}

export function ContentForm({ action, defaults }: { action: (formData: FormData) => void; defaults: ContentDefaults }) {
  return (
    <form action={action} className="max-w-2xl space-y-4">
      {defaults.id && <input type="hidden" name="id" value={defaults.id} />}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" defaultValue={defaults.title} required />
        </div>
        <div>
          <Label htmlFor="slug">Slug (URL)</Label>
          <Input id="slug" name="slug" defaultValue={defaults.slug} required placeholder="new-york" />
        </div>
      </div>
      <div>
        <Label htmlFor="heroImage">Hero image URL</Label>
        <Input id="heroImage" name="heroImage" defaultValue={defaults.heroImage} required />
      </div>
      <div>
        <Label htmlFor="bodyMarkdown">Body (Markdown)</Label>
        <textarea
          id="bodyMarkdown"
          name="bodyMarkdown"
          defaultValue={defaults.bodyMarkdown}
          required
          rows={10}
          className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 font-mono text-xs focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        />
      </div>
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input type="checkbox" name="published" defaultChecked={defaults.published ?? true} />
        Published
      </label>
      <Button type="submit">Save page</Button>
    </form>
  );
}
