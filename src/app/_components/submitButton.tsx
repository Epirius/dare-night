import { forwardRef } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "~/components/ui/button";
import { type ScriptProps } from "next/script";
import { Loader2 } from "lucide-react";

export const SubmitButton = forwardRef<HTMLButtonElement, ScriptProps>(
  (props, ref) => {
    const { pending } = useFormStatus();

    return (
      <Button disabled={pending} ref={ref} className="gap-2">
        {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {props.children ?? "Submit"}
      </Button>
    );
  },
);

SubmitButton.displayName = "SubmitButton";
