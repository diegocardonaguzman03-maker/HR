"use client";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/primitives";
import { Modal } from "@/components/ui/Modal";

const CloseContext = createContext<(() => void) | null>(null);
/** Lets forms rendered inside a NewButton modal close it after a successful save. */
export const useCloseModal = () => useContext(CloseContext);

/** Button + modal; also opens when the URL has ?new=1 (used by the command palette). */
export function NewButton({ label, title, description, children, wide }: { label: string; title: string; description?: string; children: ReactNode; wide?: boolean }) {
  const params = useSearchParams();
  const router = useRouter();
  const path = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => { if (params.get("new") === "1") setOpen(true); }, [params]);
  const change = (o: boolean) => { setOpen(o); if (!o && params.get("new")) router.replace(path); };
  return (
    <>
      <Button variant="primary" onClick={() => setOpen(true)}><Plus size={14} />{label}</Button>
      <Modal open={open} onOpenChange={change} title={title} description={description} wide={wide}>
        <CloseContext.Provider value={() => change(false)}>{children}</CloseContext.Provider>
      </Modal>
    </>
  );
}
