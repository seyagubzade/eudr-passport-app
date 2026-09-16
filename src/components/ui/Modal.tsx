import {
  Dialog,
  IconButton,
  Portal,
  Text,
} from "@chakra-ui/react";
import type { FormEvent, ReactNode } from "react";
import { Icon } from "../Icon";
import { Button } from "./Button";

interface ModalProps {
  open: boolean;
  title: string;
  lede?: string;
  wide?: boolean;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}

export function Modal({ open, title, lede, wide, onClose, children, footer }: ModalProps) {
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(event) => {
        if (!event.open) onClose();
      }}
      size={wide ? "lg" : "md"}
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content rounded="2xl">
            <Dialog.Header>
              <Dialog.Title>{title}</Dialog.Title>
              <Dialog.CloseTrigger asChild>
                <IconButton variant="ghost" size="sm" aria-label="Close">
                  <Icon name="close" />
                </IconButton>
              </Dialog.CloseTrigger>
            </Dialog.Header>
            <Dialog.Body>
              {lede ? (
                <Text color="fg.muted" fontSize="sm" mb="4">
                  {lede}
                </Text>
              ) : null}
              {children}
            </Dialog.Body>
            {footer ? <Dialog.Footer>{footer}</Dialog.Footer> : null}
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}

interface ModalFormProps {
  open: boolean;
  title: string;
  lede?: string;
  wide?: boolean;
  submitLabel: string;
  submitVariant?: "primary" | "danger-solid";
  busy?: boolean;
  onClose: () => void;
  onSubmit: () => void | Promise<void>;
  children: ReactNode;
}

export function ModalForm({
  open,
  title,
  lede,
  wide,
  submitLabel,
  submitVariant = "primary",
  busy,
  onClose,
  onSubmit,
  children,
}: ModalFormProps) {
  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    void onSubmit();
  }

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(event) => {
        if (!event.open) onClose();
      }}
      size={wide ? "lg" : "md"}
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content rounded="2xl" as="form" onSubmit={handleSubmit}>
            <Dialog.Header>
              <Dialog.Title>{title}</Dialog.Title>
              <Dialog.CloseTrigger asChild>
                <IconButton variant="ghost" size="sm" aria-label="Close">
                  <Icon name="close" />
                </IconButton>
              </Dialog.CloseTrigger>
            </Dialog.Header>
            <Dialog.Body>
              {lede ? (
                <Text color="fg.muted" fontSize="sm" mb="4">
                  {lede}
                </Text>
              ) : null}
              {children}
            </Dialog.Body>
            <Dialog.Footer>
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" variant={submitVariant} loading={busy}>
                {submitLabel}
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
