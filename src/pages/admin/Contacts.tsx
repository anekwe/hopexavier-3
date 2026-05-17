import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function Contacts() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContacts = async () => {
      setLoading(true);
      try {
        if (!supabase) throw new Error("Supabase is not configured.");
        
        const dbPromise = supabase
          .from('contacts')
          .select('*')
          .order('created_at', { ascending: false });

        const timeoutPromise = new Promise<{ data: any, error: any }>((resolve) => 
          setTimeout(() => resolve({ data: null, error: new Error('TIMEOUT') }), 8000)
        );

        const { data, error } = await Promise.race([dbPromise, timeoutPromise]) as { data: any, error: any };

        let loadedData = [];
        if (error) {
           if (error.message === 'TIMEOUT') {
              console.warn("Supabase request timed out. Loading local data.");
           } else if (error.code === '42P01' || error.message?.includes('does not exist')) {
              console.warn("Table contacts does not exist. Please run the SQL schema.");
           } else {
              console.error("Supabase error:", error);
           }
        } else if (data) {
           loadedData = data;
        }

        try {
           const localContacts = JSON.parse(localStorage.getItem('local_contacts') || '[]');
           loadedData = [...localContacts, ...loadedData];
        } catch(e) {}
        setContacts(loadedData);
      } catch (e: any) {
        console.error("Error fetching contacts:", e);
        let localContacts = [];
        try {
           localContacts = JSON.parse(localStorage.getItem('local_contacts') || '[]');
        } catch(er) {}
        setContacts(localContacts);
      } finally {
        setLoading(false);
      }
    };
    fetchContacts();
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
