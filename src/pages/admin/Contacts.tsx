import { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { queryWithTimeout } from '@/lib/utils/supabase-timeout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Search, Loader2, Archive, CheckCircle, Trash2, Mail } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export default function Contacts() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');

  const fetchContacts = async (showFullLoader = true) => {
    if (showFullLoader) setLoading(true);
    try {
      if (!isSupabaseConfigured) {
        const localData = localStorage.getItem('hopexavier_mock_contacts');
        if (localData) {
          setContacts(JSON.parse(localData));
        } else {
          const seed = [
            {
              id: 'mock-msg-1',
              created_at: new Date().toISOString(),
              name: 'Dr. Chioma',
              email: 'chioma@gmail.com',
              message: 'Hello Hopexavier First Academy, please when are admissions starting for next term?',
              status: 'Unread'
            }
          ];
          localStorage.setItem('hopexavier_mock_contacts', JSON.stringify(seed));
          setContacts(seed);
        }
        return;
      }

      const { data, error } = await queryWithTimeout(supabase
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false }));

      if (error) {
         console.error("Supabase error:", error);
         toast.error("Failed to fetch enquiries");
      } else {
         setContacts(data || []);
      }
    } catch (e: any) {
      console.error("Error fetching contacts:", e);
    } finally {
      if (showFullLoader) setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts(true);

    if (isSupabaseConfigured && supabase) {
      const channel = supabase
        .channel('contacts_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'contacts' }, () => {
          fetchContacts(false);
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, []);

  const updateStatus = async (id: string, newStatus: string) => {
     // Local instant state update
     setContacts(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));

     try {
       if (!isSupabaseConfigured) {
          const localData = localStorage.getItem('hopexavier_mock_contacts');
          if (localData) {
             const parsed = JSON.parse(localData);
             const updated = parsed.map((c: any) => c.id === id ? { ...c, status: newStatus } : c);
             localStorage.setItem('hopexavier_mock_contacts', JSON.stringify(updated));
          }
          toast.success(`Message marked as ${newStatus}`);
          return;
       }

       const { error } = await supabase.from('contacts').update({ status: newStatus }).eq('id', id);
       if (error) throw error;
       toast.success(`Message marked as ${newStatus}`);
       fetchContacts(false);
       window.dispatchEvent(new Event('dashboardStatsNeedRefresh'));
     } catch (e: any) {
       toast.error("Failed to update status");
       fetchContacts(false);
     }
  };

  const deleteMessage = async (id: string) => {
     if(!window.confirm("Are you sure you want to delete this enquiry?")) return;
     // Instant local update
     setContacts(prev => prev.filter(c => c.id !== id));

     try {
       if (!isSupabaseConfigured) {
         const localData = localStorage.getItem('hopexavier_mock_contacts');
         if (localData) {
            const parsed = JSON.parse(localData);
            const filtered = parsed.filter((c: any) => c.id !== id);
            localStorage.setItem('hopexavier_mock_contacts', JSON.stringify(filtered));
         }
         toast.success("Message deleted permanently.");
         return;
       }

       const { error } = await supabase.from('contacts').delete().eq('id', id);
       if (error) throw error;
       toast.success("Message deleted");
       fetchContacts(false);
       window.dispatchEvent(new Event('dashboardStatsNeedRefresh'));
     } catch (e: any) {
       toast.error("Failed to delete message");
       fetchContacts(false);
     }
  };

  const filteredContacts = contacts.filter((c) => {
    const matchesSearch = 
      c.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      c.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.message?.toLowerCase().includes(searchQuery.toLowerCase());
      
    const status = c.status || 'Unread';
    const matchesStatus = filterStatus === 'All' ? true : status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Enquiries</h1>
          <p className="text-muted-foreground">View and manage messages sent via the public contact form.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-border p-4 md:p-6 space-y-4">
         <div className="flex flex-col sm:flex-row justify-between gap-4 border-b pb-4">
             <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                   placeholder="Search messages..." 
                   className="pl-8" 
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                />
             </div>
             <div className="flex items-center gap-2">
                <select className="text-sm border rounded p-2 bg-white" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                   <option value="All">All Statuses</option>
                   <option value="Unread">Unread</option>
                   <option value="Read">Read</option>
                   <option value="Archived">Archived</option>
                </select>
             </div>
         </div>
      
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-32">Date</TableHead>
                <TableHead className="w-64">Sender Info</TableHead>
                <TableHead>Message</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
               {loading ? (
                <TableRow>
                   <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                       <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-brand-green" />
                       Loading messages...
                   </TableCell>
                </TableRow>
              ) : filteredContacts.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center py-10 text-muted-foreground">No messages match your filters.</TableCell></TableRow>
              ) : (
                filteredContacts.map((msg) => {
                  const status = msg.status || 'Unread';
                  return (
                    <TableRow key={msg.id} className={status === 'Unread' ? 'bg-slate-50' : ''}>
                       <TableCell className="align-top whitespace-nowrap">
                          {new Date(msg.created_at).toLocaleDateString()}
                          <div className="mt-2 text-xs text-muted-foreground">{new Date(msg.created_at).toLocaleTimeString()}</div>
                          <Badge variant="outline" className={`mt-2 ${status === 'Unread' ? 'bg-amber-100 text-amber-800 border-amber-200' : status === 'Read' ? 'bg-blue-100 text-blue-800 border-blue-200' : 'bg-gray-100 text-gray-800'}`}>
                             {status}
                          </Badge>
                       </TableCell>
                      <TableCell className="align-top">
                        <div className="font-semibold">{msg.name}</div>
                        <div className="text-sm text-blue-600 hover:underline">
                           <a href={`mailto:${msg.email}`}>{msg.email}</a>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">{msg.phone}</div>
                      </TableCell>
                      <TableCell className="align-top whitespace-pre-wrap text-sm leading-relaxed max-w-md">
                         {msg.message}
                      </TableCell>
                      <TableCell className="align-top text-right">
                         <div className="flex flex-col gap-2 items-end">
                            {status === 'Unread' && (
                               <Button variant="outline" size="sm" onClick={() => updateStatus(msg.id, 'Read')} className="w-full max-w-[120px] justify-start"><CheckCircle className="h-4 w-4 mr-2 text-green-600"/> Mark Read</Button>
                            )}
                            {status !== 'Archived' && (
                               <Button variant="outline" size="sm" onClick={() => updateStatus(msg.id, 'Archived')} className="w-full max-w-[120px] justify-start"><Archive className="h-4 w-4 mr-2 text-gray-600"/> Archive</Button>
                            )}
                            <Button variant="outline" size="sm" onClick={() => window.open(`mailto:${msg.email}?subject=Reply from Hopexavier First Academy`)} className="w-full max-w-[120px] justify-start"><Mail className="h-4 w-4 mr-2 text-blue-500" /> Reply</Button>
                            <Button variant="outline" size="sm" onClick={() => deleteMessage(msg.id)} className="w-full max-w-[120px] justify-start text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4 mr-2"/> Delete</Button>
                         </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
