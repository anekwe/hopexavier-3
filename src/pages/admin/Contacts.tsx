import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function Contacts() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      if (!supabase) throw new Error("Supabase is not configured.");
      
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
         console.error("Supabase error:", error);
      } else {
         setContacts(data || []);
      }
    } catch (e: any) {
      console.error("Error fetching contacts:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();

    if (supabase) {
      const channel = supabase
        .channel('contacts_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'contacts' }, () => {
          fetchContacts();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, []);

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Enquiries</h1>
        <p className="text-muted-foreground">View messages sent via the public contact form.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Sender Info</TableHead>
              <TableHead>Message</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
             {loading ? (
              <TableRow><TableCell colSpan={3} className="text-center py-10 text-muted-foreground">Loading messages...</TableCell></TableRow>
            ) : contacts.length === 0 ? (
              <TableRow><TableCell colSpan={3} className="text-center py-10 text-muted-foreground">No messages found.</TableCell></TableRow>
            ) : (
              contacts.map((msg) => (
                <TableRow key={msg.id}>
                   <TableCell className="align-top w-32">{new Date(msg.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="align-top w-64">
                    <div className="font-medium">{msg.name}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                       {msg.email} <br/> {msg.phone}
                    </div>
                  </TableCell>
                  <TableCell className="align-top whitespace-pre-wrap">{msg.message}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
