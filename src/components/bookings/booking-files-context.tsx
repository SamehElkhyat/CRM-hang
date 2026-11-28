"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { AttachmentWithUploader } from "./attachments-list";
import type { Database } from "@/types/database.types";

type AttachmentRow = Database["public"]["Tables"]["booking_attachments"]["Row"];

interface BookingFiles {
  files: AttachmentWithUploader[];
  addFile: (file: AttachmentWithUploader) => void;
}

const BookingFilesContext = createContext<BookingFiles | null>(null);

export function useBookingFiles() {
  const context = useContext(BookingFilesContext);
  if (!context) throw new Error("useBookingFiles must be used inside BookingFilesProvider");
  return context;
}

/**
 * One list of a booking's files, shared by the attachments panel and the
 * chat, so an upload shows up in both at the same moment.
 */
export function BookingFilesProvider({
  bookingId,
  initialFiles,
  children,
}: {
  bookingId: string;
  initialFiles: AttachmentWithUploader[];
  children: React.ReactNode;
}) {
  const [supabase] = useState(() => createClient());
  const [files, setFiles] = useState(initialFiles);

  // Newest first, and never the same file twice (our own upload also comes
  // back to us over realtime).
  const addFile = useCallback((file: AttachmentWithUploader) => {
    setFiles((prev) => (prev.some((f) => f.id === file.id) ? prev : [file, ...prev]));
  }, []);

  // Files uploaded by colleagues. Its own channel on purpose: if the
  // booking_attachments table is not in the realtime publication yet, only
  // this subscription is affected and the live chat keeps working.
  useEffect(() => {
    const channel = supabase
      .channel(`booking-attachments-${bookingId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "booking_attachments",
          filter: `booking_id=eq.${bookingId}`,
        },
        async (payload) => {
          const row = payload.new as AttachmentRow;
          const { data } = row.uploaded_by
            ? await supabase
                .from("profiles")
                .select("full_name")
                .eq("id", row.uploaded_by)
                .single()
            : { data: null };
          addFile({
            id: row.id,
            file_name: row.file_name,
            file_path: row.file_path,
            file_type: row.file_type,
            file_size: row.file_size,
            created_at: row.created_at,
            uploaded_by: row.uploaded_by,
            uploader_name: data?.full_name ?? null,
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [addFile, bookingId, supabase]);

  return (
    <BookingFilesContext.Provider value={{ files, addFile }}>
      {children}
    </BookingFilesContext.Provider>
  );
}
