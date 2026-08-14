import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function DraftEditor({
  subject,
  body,
  readOnly,
  onSubjectChange,
  onBodyChange,
}: {
  subject: string;
  body: string;
  readOnly?: boolean;
  onSubjectChange: (v: string) => void;
  onBodyChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="draft-subject">عنوان الرسالة</Label>
        <Input
          id="draft-subject"
          value={subject}
          onChange={(e) => onSubjectChange(e.target.value)}
          readOnly={readOnly}
          dir="auto"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="draft-body">نص الرسالة</Label>
        <Textarea
          id="draft-body"
          value={body}
          onChange={(e) => onBodyChange(e.target.value)}
          readOnly={readOnly}
          dir="auto"
          className="min-h-64 resize-y"
        />
      </div>
    </div>
  );
}
