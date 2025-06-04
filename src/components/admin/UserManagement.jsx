import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Users, RefreshCw, Server as ServerIcon, Trash2 } from 'lucide-react';

const ITEMS_PER_PAGE = 15;

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const { toast } = useToast();

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data: orderUserIds, error: orderUsersError } = await supabase
        .from('orders')
        .select('user_id')
        .not('user_id', 'is', null);
      
      if (orderUsersError) throw orderUsersError;

      const { data: serviceRequestUserIds, error: requestUsersError } = await supabase
        .from('service_requests')
        .select('user_id')
        .not('user_id', 'is', null);

      if (requestUsersError) throw requestUsersError;
      
      const allUserIds = [
        ...(orderUserIds || []).map(u => u.user_id),
        ...(serviceRequestUserIds || []).map(u => u.user_id)
      ].filter(id => id != null);

      const uniqueUserIds = [...new Set(allUserIds)];
      
      let PagedUsers = [];
      if (uniqueUserIds.length > 0) {
        // Try to fetch from a 'public.users' table if it exists (as a mirror/profile table)
        // This is a common pattern when you need to store additional user data publicly.
        // Supabase's `auth.users` is not directly queryable for listing by non-admins from client-side.
        const { data: fetchedUsersFromPublic, error: publicUsersError } = await supabase
          .from('users') // Assuming 'users' is your public table mirroring auth.users
          .select('id, email, raw_user_meta_data, created_at, last_sign_in_at')
          .in('id', uniqueUserIds);

        if (publicUsersError && publicUsersError.message.includes('relation "public.users" does not exist')) {
            console.warn("Public 'users' table not found. Attempting to get minimal info for active users. For full user management, a server-side solution or a public 'profiles' table is recommended.");
            // Fallback: Construct user objects from IDs if public.users doesn't exist.
            // Email and other details might not be available without admin rights or a profiles table.
            // To get email, we would ideally join with auth.users on the server or have it in profiles.
            // For client-side, this is the best we can do without a public user profile table.
            // We'll try to get emails from the original order/request user_id objects if they contained them (which they might if Supabase RLS allows for the user themselves).
            // This is a bit of a hack and depends on how user_id was selected in previous queries.
            
            // Let's simulate by just creating placeholder if email isn't directly available
            PagedUsers = uniqueUserIds.map(id => {
                 // Try to find if email was fetched with the ID in orderUserIds or serviceRequestUserIds
                const orderUser = (orderUserIds || []).find(u => u.user_id === id);
                const requestUser = (serviceRequestUserIds || []).find(u => u.user_id === id);
                // Note: This is not a robust way to get email. user_id in orders/requests might just be the UUID.
                // A 'profiles' table is the correct way.
                const email = orderUser?.user_id_data?.email || requestUser?.user_id_data?.email || `ID: ${id.substring(0,8)} (Email N/A)`;
                return {
                    id: id,
                    email: email, 
                    created_at: 'N/A', 
                    last_sign_in_at: 'N/A' 
                };
            });
        } else if (publicUsersError) {
            throw publicUsersError; // Other errors with public.users table
        } else {
            PagedUsers = fetchedUsersFromPublic || [];
        }


        if (searchTerm) {
          PagedUsers = PagedUsers.filter(user => 
            (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (user.id && user.id.toLowerCase().includes(searchTerm.toLowerCase()))
          );
        }
      }
      
      setTotalUsers(PagedUsers.length);
      const paginatedData = PagedUsers.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
      setUsers(paginatedData);

    } catch (error) {
      console.error("Error fetching user data:", error);
      toast({ title: "خطأ", description: `لم نتمكن من جلب بيانات المستخدمين: ${error.message}`, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast, searchTerm, currentPage]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };
  
  const handleDeleteUser = async (userId) => {
     toast({ title: "تنبيه", description: "حذف المستخدمين يتطلب صلاحيات مسؤول متقدمة ويتم من خلال واجهة Supabase مباشرة أو API مخصص.", variant: "default" });
  };
  
  const formatDate = (dateString) => {
    if (!dateString || dateString === 'N/A') return 'غير متوفر';
    try {
      return new Date(dateString).toLocaleString('ar-EG', { dateStyle: 'medium', timeStyle: 'short' });
    } catch (e) {
      return 'تاريخ غير صالح';
    }
  };

  const totalPages = Math.ceil(totalUsers / ITEMS_PER_PAGE);
  const renderPagination = () => {
    if (totalPages <= 1) return null;
    const pagesToShow = 5; 
    let startPage = Math.max(1, currentPage - Math.floor(pagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + pagesToShow - 1);
    if (endPage - startPage + 1 < pagesToShow) {
        startPage = Math.max(1, endPage - pagesToShow + 1);
    }

    const pageButtons = [];
    for (let i = startPage; i <= endPage; i++) {
      pageButtons.push(
        <Button
          key={i}
          variant={currentPage === i ? 'default' : 'outline'}
          size="sm"
          onClick={() => setCurrentPage(i)}
          className={`mx-1 ${currentPage === i ? 'bg-purple-600 hover:bg-purple-700' : 'bg-slate-700 hover:bg-slate-600 border-slate-600 text-slate-300'}`}
        >
          {i}
        </Button>
      );
    }
    return (
      <div className="flex justify-center items-center mt-6">
        <Button 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
            disabled={currentPage === 1}
            variant="outline" size="sm" className="bg-slate-700 hover:bg-slate-600 border-slate-600 text-slate-300"
        >
            السابق
        </Button>
        {startPage > 1 && <span className="mx-1 text-slate-400">...</span>}
        {pageButtons}
        {endPage < totalPages && <span className="mx-1 text-slate-400">...</span>}
        <Button 
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
            disabled={currentPage === totalPages}
            variant="outline" size="sm" className="bg-slate-700 hover:bg-slate-600 border-slate-600 text-slate-300"
        >
            التالي
        </Button>
      </div>
    );
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700 shadow-lg">
      <CardHeader className="flex flex-col sm:flex-row justify-between items-center">
        <CardTitle className="text-2xl text-yellow-300 flex items-center"><Users className="ml-2 h-6 w-6"/> إدارة المستخدمين (العملاء النشطين: {totalUsers})</CardTitle>
         <div className="flex items-center gap-2 w-full sm:w-auto">
            <Input 
                type="search" 
                placeholder="بحث بالبريد الإلكتروني أو ID..." 
                value={searchTerm}
                onChange={handleSearch}
                className="bg-slate-700 border-slate-600 placeholder-slate-400 sm:max-w-xs w-full"
            />
            <Button onClick={fetchUsers} variant="ghost" size="icon" disabled={loading}>
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <RefreshCw className="h-5 w-5 text-slate-400 hover:text-yellow-300" />}
            </Button>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-slate-500 mb-4">ملاحظة: هذه القائمة تعرض المستخدمين الذين لديهم طلبات. الإدارة الكاملة لحسابات المستخدمين (مثل تعديل كلمة المرور أو الحظر) تتم من خلال لوحة تحكم Supabase أو API مخصص بامتيازات المسؤول.</p>
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-yellow-400" />
          </div>
        ) : users.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-right text-slate-300">
              <thead className="text-xs text-yellow-300 uppercase bg-slate-700">
                <tr>
                  <th scope="col" className="px-3 py-3">معرف المستخدم/البريد</th>
                  <th scope="col" className="px-3 py-3">تاريخ التسجيل</th>
                  <th scope="col" className="px-3 py-3">آخر تسجيل دخول</th>
                  <th scope="col" className="px-3 py-3">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} className="bg-slate-800 border-b border-slate-700 hover:bg-slate-700/50">
                    <td className="px-3 py-3">{user.email || user.id}</td>
                    <td className="px-3 py-3">{formatDate(user.created_at)}</td>
                    <td className="px-3 py-3">{user.last_sign_in_at ? formatDate(user.last_sign_in_at) : 'غير متوفر'}</td>
                    <td className="px-3 py-3">
                      <Button variant="outline" size="xs" className="border-red-500 text-red-400 hover:bg-red-500/20 hover:text-red-300 text-xs px-1.5 py-0.5" onClick={() => handleDeleteUser(user.id)}>
                        <Trash2 className="ml-1 h-3 w-3" /> حذف (تنبيه)
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {renderPagination()}
          </div>
        ) : (
          <div className="text-center py-10">
            <ServerIcon className="mx-auto h-12 w-12 text-slate-500" />
            <p className="mt-2 text-slate-400">لا يوجد مستخدمون لعرضهم حالياً (أو تطابق معايير البحث).</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserManagement;