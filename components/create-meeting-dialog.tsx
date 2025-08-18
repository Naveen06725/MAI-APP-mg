"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Loader2 } from "lucide-react"
import { createMeeting } from "@/lib/actions"
import { useEffect } from "react"

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending} className="bg-purple-600 hover:bg-purple-700">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Creating...
        </>
      ) : (
        "Create Meeting"
      )}
    </Button>
  )
}

interface CreateMeetingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function CreateMeetingDialog({ open, onOpenChange }: CreateMeetingDialogProps) {
  const [state, formAction] = useActionState(createMeeting, null)

  useEffect(() => {
    if (state?.success) {
      onOpenChange(false)
    }
  }, [state, onOpenChange])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-white/20 text-white">
        <DialogHeader>
          <DialogTitle>Create New Meeting</DialogTitle>
          <DialogDescription className="text-gray-300">Set up a new meeting for your team</DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          {state?.error && (
            <div className="bg-destructive/10 border border-destructive/50 text-destructive px-4 py-3 rounded">
              {state.error}
            </div>
          )}
          {state?.success && (
            <div className="bg-primary/10 border border-primary/50 text-primary px-4 py-3 rounded">{state.success}</div>
          )}

          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Meeting Title
            </label>
            <Input id="title" name="title" placeholder="Weekly Team Sync" required className="bg-card border-border" />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description (Optional)
            </label>
            <Textarea
              id="description"
              name="description"
              placeholder="Discuss project updates and next steps..."
              className="bg-card border-border"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <SubmitButton />
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
