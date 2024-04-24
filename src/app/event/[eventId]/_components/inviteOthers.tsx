"use client";
import { Copy } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { createOtpCode } from "~/server/queries";

export function InviteOthers({ eventId }: { eventId: number }) {
  "use client";
  const [code, setCode] = useState<string | undefined>(undefined);

  const copyCode = async () => {
    if (!code) return;
    await navigator.clipboard.writeText(code.toString());
  };

  const generateCode = async () => {
    const response = await createOtpCode(eventId, false);
    if ("error" in response) {
      console.error(response.error);
      return;
    }
    setCode(response.otp);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" onClick={generateCode}>
          Invite others
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>Invite Others</DialogHeader>
        <DialogDescription>
          Invite others to this event by sharing the code below:
        </DialogDescription>
        <div className="flex items-center gap-2">
          <Label className="sr-only">Code</Label>
          <Input
            className="cursor-pointer"
            id="code"
            value={code ?? "Generating code ..."}
            readOnly
            onClick={copyCode}
          />
          <Button type="submit" size="sm" onClick={copyCode}>
            <span className="sr-only">Copy</span>
            <Copy />
          </Button>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
