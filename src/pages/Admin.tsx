import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { SUBSCRIPTION_PLANS, SubscriptionPlan } from "@/contexts/SubscriptionContext";
import { 
  Film, Tv, Users, CreditCard, Wallet, Plus, Trash2, Edit, 
  LogOut, Menu, X, ChevronDown, DollarSign, TrendingUp, Eye, Crown, RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import { fetchBackendTransactions, BackendTransaction } from "@/lib/mobileMoneyApi";
import {
  subscribeToMovies,
  subscribeToUsers,
  subscribeToSubscriptions,
  subscribeToTransactions,
  subscribeToWallet,
  addMovie,
  updateMovie,
  deleteMovie,
  addEpisodeToSeries,
  updateEpisode,
  deleteEpisode,
  addSubscription,
  updateSubscription,
  withdrawFromWallet,
  FirebaseMovie,
  FirebaseUser,
  Subscription,
  Transaction,
  WalletData,
  Episode,
  WithdrawRequest,
} from "@/lib/firebase";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Admin = () => {
  const { user, isAdminUser, signOut } = useAuth();
  const navigate = useNavigate();
  
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("movies");
  
  // Data states
  const [movies, setMovies] = useState<FirebaseMovie[]>([]);
  const [users, setUsers] = useState<FirebaseUser[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [wallet, setWallet] = useState<WalletData>({ balance: 0, currency: "UGX", lastUpdated: "" });
  
  // Modal states
  const [addMovieOpen, setAddMovieOpen] = useState(false);
  const [addSeriesOpen, setAddSeriesOpen] = useState(false);
  const [addEpisodeOpen, setAddEpisodeOpen] = useState(false);
  const [manageEpisodesOpen, setManageEpisodesOpen] = useState(false);
  const [addSubscriptionOpen, setAddSubscriptionOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [selectedSeries, setSelectedSeries] = useState<FirebaseMovie | null>(null);
  const [editingMovie, setEditingMovie] = useState<FirebaseMovie | null>(null);
  const [userSubscriptionOpen, setUserSubscriptionOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<FirebaseUser | null>(null);
  const [editSubscriptionOpen, setEditSubscriptionOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);

  // Redirect if not admin
  useEffect(() => {
    if (!isAdminUser && user !== null) {
      navigate("/");
      toast.error("Access denied. Admin only.");
    }
  }, [isAdminUser, user, navigate]);

  // Subscribe to data
  useEffect(() => {
    const unsubMovies = subscribeToMovies(setMovies);
    const unsubUsers = subscribeToUsers(setUsers);
    const unsubSubs = subscribeToSubscriptions(setSubscriptions);
    const unsubTx = subscribeToTransactions(setTransactions);
    const unsubWallet = subscribeToWallet(setWallet);

    return () => {
      unsubMovies();
      unsubUsers();
      unsubSubs();
      unsubTx();
      unsubWallet();
    };
  }, []);

  if (!isAdminUser) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
          <p className="text-muted-foreground">This page is only accessible to administrators.</p>
        </div>
      </div>
    );
  }

  const series = movies.filter(m => m.type === "series");
  const moviesOnly = movies.filter(m => m.type === "movie");
  const activeSubscriptions = subscriptions.filter(s => s.isActive && new Date(s.expiresAt) > new Date());
  const totalRevenue = transactions.filter(t => t.type === "subscription" && t.status === "completed").reduce((acc, t) => acc + t.amount, 0);

  const sidebarItems = [
    { id: "movies", label: "Movies", icon: Film, count: moviesOnly.length },
    { id: "series", label: "TV Series", icon: Tv, count: series.length },
    { id: "users", label: "Users", icon: Users, count: users.length },
    { id: "subscriptions", label: "Subscriptions", icon: CreditCard, count: activeSubscriptions.length },
    { id: "wallet", label: "Wallet", icon: Wallet },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? "w-64" : "w-16"} bg-card border-r border-border transition-all duration-300 flex flex-col`}>
        {/* Logo */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-border">
          {sidebarOpen && (
            <span className="font-bold text-primary">Admin Panel</span>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 p-2 space-y-1">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                activeTab === item.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && (
                <>
                  <span className="flex-1 text-left text-sm">{item.label}</span>
                  {item.count !== undefined && (
                    <span className="text-xs opacity-70">{item.count}</span>
                  )}
                </>
              )}
            </button>
          ))}
        </nav>

        {/* User Section */}
        <div className="p-3 border-t border-border">
          <button
            onClick={() => signOut().then(() => navigate("/"))}
            className="w-full flex items-center gap-3 px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span className="text-sm">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="h-14 bg-card border-b border-border flex items-center justify-between px-6">
          <h1 className="text-lg font-semibold text-foreground capitalize">{activeTab}</h1>
          <div className="flex items-center gap-2">
            {activeTab === "movies" && (
              <button
                onClick={() => setAddMovieOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Movie
              </button>
            )}
            {activeTab === "series" && (
              <button
                onClick={() => setAddSeriesOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Series
              </button>
            )}
            {activeTab === "subscriptions" && (
              <button
                onClick={() => setAddSubscriptionOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Subscription
              </button>
            )}
            {activeTab === "wallet" && (
              <button
                onClick={() => setWithdrawOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
              >
                <DollarSign className="w-4 h-4" />
                Withdraw
              </button>
            )}
          </div>
        </header>

        {/* Content */}
        <div className="p-6">
          {/* Movies Tab */}
          {activeTab === "movies" && (
            <MoviesTable 
              movies={moviesOnly} 
              onEdit={setEditingMovie}
              onDelete={async (id) => {
                await deleteMovie(id, "movies");
                toast.success("Movie deleted");
              }}
            />
          )}

          {/* Series Tab */}
          {activeTab === "series" && (
            <SeriesTable 
              series={series}
              onEdit={setEditingMovie}
              onAddEpisode={(s) => {
                setSelectedSeries(s);
                setAddEpisodeOpen(true);
              }}
              onManageEpisodes={(s) => {
                setSelectedSeries(s);
                setManageEpisodesOpen(true);
              }}
              onDelete={async (id) => {
                await deleteMovie(id, "series");
                toast.success("Series deleted");
              }}
            />
          )}

          {/* Users Tab */}
          {activeTab === "users" && (
            <UsersTable 
              users={users} 
              subscriptions={subscriptions}
              onActivateSubscription={(u) => {
                setSelectedUser(u);
                setUserSubscriptionOpen(true);
              }}
            />
          )}

          {/* Subscriptions Tab - Show only active subscriptions */}
          {activeTab === "subscriptions" && (
            <SubscriptionsTable 
              subscriptions={activeSubscriptions}
              onToggle={async (sub) => {
                await updateSubscription(sub.id, { isActive: !sub.isActive });
                toast.success(sub.isActive ? "Subscription deactivated" : "Subscription activated");
              }}
              onChangePlan={(sub) => {
                setSelectedSubscription(sub);
                setEditSubscriptionOpen(true);
              }}
            />
          )}

          {/* Wallet Tab */}
          {activeTab === "wallet" && (
            <WalletView wallet={wallet} transactions={transactions} totalRevenue={totalRevenue} />
          )}
        </div>
      </main>

      {/* Add Movie Modal */}
      <AddContentModal
        open={addMovieOpen}
        onOpenChange={setAddMovieOpen}
        type="movie"
        onSave={async (data) => {
          await addMovie(data, "movies");
          toast.success("Movie added successfully");
          setAddMovieOpen(false);
        }}
      />

      {/* Add Series Modal */}
      <AddContentModal
        open={addSeriesOpen}
        onOpenChange={setAddSeriesOpen}
        type="series"
        onSave={async (data) => {
          await addMovie(data, "series");
          toast.success("Series added successfully");
          setAddSeriesOpen(false);
        }}
      />

      {/* Edit Content Modal */}
      {editingMovie && (
        <AddContentModal
          open={!!editingMovie}
          onOpenChange={(open) => !open && setEditingMovie(null)}
          type={editingMovie.type}
          initialData={editingMovie}
          onSave={async (data) => {
            const category = editingMovie.type === "series" ? "series" : "movies";
            await updateMovie(editingMovie.id, data, category);
            toast.success("Updated successfully");
            setEditingMovie(null);
          }}
        />
      )}

      {/* Add Episode Modal */}
      <AddEpisodeModal
        open={addEpisodeOpen}
        onOpenChange={setAddEpisodeOpen}
        series={selectedSeries}
        onSave={async (episode) => {
          if (selectedSeries) {
            await addEpisodeToSeries(selectedSeries.id, episode);
            toast.success("Episode added successfully");
            setAddEpisodeOpen(false);
            setSelectedSeries(null);
          }
        }}
      />

      {/* Add Subscription Modal */}
      <AddSubscriptionModal
        open={addSubscriptionOpen}
        onOpenChange={setAddSubscriptionOpen}
        users={users}
        onSave={async (data) => {
          await addSubscription(data);
          toast.success("Subscription added successfully");
          setAddSubscriptionOpen(false);
        }}
      />

      {/* Withdraw Modal */}
      <WithdrawModal
        open={withdrawOpen}
        onOpenChange={setWithdrawOpen}
        wallet={wallet}
        adminEmail={user?.email || ""}
        onWithdraw={async (request) => {
          const txRef = await withdrawFromWallet(request);
          toast.success(`Withdrawal successful! Ref: ${txRef}`);
          setWithdrawOpen(false);
        }}
      />

      {/* Manage Episodes Modal */}
      <ManageEpisodesModal
        open={manageEpisodesOpen}
        onOpenChange={setManageEpisodesOpen}
        series={selectedSeries}
        onUpdateEpisode={async (seriesId, index, data) => {
          await updateEpisode(seriesId, index, data);
          toast.success("Episode updated");
        }}
        onDeleteEpisode={async (seriesId, index) => {
          await deleteEpisode(seriesId, index);
          toast.success("Episode deleted");
        }}
      />

      {/* User Subscription Modal - Activate/Change subscription for a user */}
      <UserSubscriptionModal
        open={userSubscriptionOpen}
        onOpenChange={setUserSubscriptionOpen}
        user={selectedUser}
        existingSubscriptions={subscriptions}
        onSave={async (data) => {
          await addSubscription(data);
          toast.success("Subscription activated successfully");
          setUserSubscriptionOpen(false);
          setSelectedUser(null);
        }}
      />

      {/* Edit Subscription Modal - Change plan for existing subscription */}
      <EditSubscriptionModal
        open={editSubscriptionOpen}
        onOpenChange={setEditSubscriptionOpen}
        subscription={selectedSubscription}
        onSave={async (subId, data) => {
          await updateSubscription(subId, data);
          toast.success("Subscription plan updated");
          setEditSubscriptionOpen(false);
          setSelectedSubscription(null);
        }}
      />
    </div>
  );
};

// Movies Table Component
const MoviesTable = ({ movies, onEdit, onDelete }: { 
  movies: FirebaseMovie[]; 
  onEdit: (movie: FirebaseMovie) => void;
  onDelete: (id: string) => void;
}) => (
  <div className="bg-card border border-border rounded-lg overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-secondary/50">
          <tr>
            <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Poster</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Title</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Category</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Year</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Popular</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {movies.map((movie) => (
            <tr key={movie.id} className="hover:bg-secondary/30 transition-colors">
              <td className="px-4 py-3">
                <img src={movie.image || "/placeholder.svg"} alt={movie.title} className="w-12 h-16 object-cover rounded" />
              </td>
              <td className="px-4 py-3 text-sm text-foreground font-medium">{movie.title}</td>
              <td className="px-4 py-3 text-sm text-muted-foreground">{movie.category}</td>
              <td className="px-4 py-3 text-sm text-muted-foreground">{movie.year}</td>
              <td className="px-4 py-3">
                {movie.isPopular && <span className="px-2 py-0.5 bg-primary/20 text-primary text-xs rounded-full">Popular</span>}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <button onClick={() => onEdit(movie)} className="p-1.5 text-muted-foreground hover:text-foreground transition-colors">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => onDelete(movie.id)} className="p-1.5 text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    {movies.length === 0 && (
      <div className="text-center py-12 text-muted-foreground">No movies found. Add your first movie!</div>
    )}
  </div>
);

// Series Table Component
const SeriesTable = ({ series, onEdit, onAddEpisode, onManageEpisodes, onDelete }: {
  series: FirebaseMovie[];
  onEdit: (movie: FirebaseMovie) => void;
  onAddEpisode: (series: FirebaseMovie) => void;
  onManageEpisodes: (series: FirebaseMovie) => void;
  onDelete: (id: string) => void;
}) => (
  <div className="bg-card border border-border rounded-lg overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-secondary/50">
          <tr>
            <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Poster</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Title</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Episodes</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Popular</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {series.map((s) => (
            <tr key={s.id} className="hover:bg-secondary/30 transition-colors">
              <td className="px-4 py-3">
                <img src={s.image || "/placeholder.svg"} alt={s.title} className="w-12 h-16 object-cover rounded" />
              </td>
              <td className="px-4 py-3 text-sm text-foreground font-medium">{s.title}</td>
              <td className="px-4 py-3">
                <button 
                  onClick={() => onManageEpisodes(s)} 
                  className="text-sm text-primary hover:underline"
                >
                  {s.episodes?.length || 0} episodes
                </button>
              </td>
              <td className="px-4 py-3">
                {s.isPopular && <span className="px-2 py-0.5 bg-primary/20 text-primary text-xs rounded-full">Popular</span>}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <button onClick={() => onAddEpisode(s)} className="p-1.5 text-muted-foreground hover:text-primary transition-colors" title="Add Episode">
                    <Plus className="w-4 h-4" />
                  </button>
                  <button onClick={() => onManageEpisodes(s)} className="p-1.5 text-muted-foreground hover:text-primary transition-colors" title="Manage Episodes">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button onClick={() => onEdit(s)} className="p-1.5 text-muted-foreground hover:text-foreground transition-colors">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => onDelete(s.id)} className="p-1.5 text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    {series.length === 0 && (
      <div className="text-center py-12 text-muted-foreground">No series found. Add your first series!</div>
    )}
  </div>
);

// Users Table Component
const UsersTable = ({ users, subscriptions, onActivateSubscription }: { 
  users: FirebaseUser[];
  subscriptions: Subscription[];
  onActivateSubscription: (user: FirebaseUser) => void;
}) => {
  // Check if user has active subscription
  const hasActiveSubscription = (userId: string): boolean => {
    return subscriptions.some(sub => 
      sub.userId === userId && 
      sub.isActive && 
      new Date(sub.expiresAt) > new Date()
    );
  };

  const getUserSubscription = (userId: string): Subscription | undefined => {
    return subscriptions.find(sub => 
      sub.userId === userId && 
      sub.isActive && 
      new Date(sub.expiresAt) > new Date()
    );
  };

  return (
  <div className="bg-card border border-border rounded-lg overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-secondary/50">
          <tr>
            <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Avatar</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Name</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Email</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Subscription</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Joined</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {users.map((u) => {
            const activeSub = getUserSubscription(u.uid);
            return (
            <tr key={u.uid} className="hover:bg-secondary/30 transition-colors">
              <td className="px-4 py-3">
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
                  {u.photoURL ? (
                    <img src={u.photoURL} alt={u.displayName} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs font-medium text-foreground">{u.displayName?.charAt(0) || "U"}</span>
                  )}
                </div>
              </td>
              <td className="px-4 py-3 text-sm text-foreground font-medium">{u.displayName || "Unknown"}</td>
              <td className="px-4 py-3 text-sm text-muted-foreground">{u.email}</td>
              <td className="px-4 py-3">
                {activeSub ? (
                  <div>
                    <span className="px-2 py-0.5 text-xs rounded-full bg-green-500/20 text-green-500">
                      {activeSub.plan.replace("_", " ")}
                    </span>
                    <p className="text-xs text-muted-foreground mt-1">
                      Expires: {new Date(activeSub.expiresAt).toLocaleDateString()}
                    </p>
                  </div>
                ) : (
                  <span className="px-2 py-0.5 text-xs rounded-full bg-muted text-muted-foreground">
                    No subscription
                  </span>
                )}
              </td>
              <td className="px-4 py-3 text-sm text-muted-foreground">{new Date(u.createdAt).toLocaleDateString()}</td>
              <td className="px-4 py-3">
                <button 
                  onClick={() => onActivateSubscription(u)} 
                  className="flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  <Crown className="w-3 h-3" />
                  {activeSub ? "Change Plan" : "Activate"}
                </button>
              </td>
            </tr>
          )})}
        </tbody>
      </table>
    </div>
    {users.length === 0 && (
      <div className="text-center py-12 text-muted-foreground">No users found.</div>
    )}
  </div>
  );
};

// Subscriptions Table Component
const SubscriptionsTable = ({ subscriptions, onToggle, onChangePlan }: { 
  subscriptions: Subscription[]; 
  onToggle: (sub: Subscription) => void;
  onChangePlan: (sub: Subscription) => void;
}) => (
  <div className="bg-card border border-border rounded-lg overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-secondary/50">
          <tr>
            <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">User</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Plan</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Amount</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Expires</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Status</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {subscriptions.map((sub) => (
            <tr key={sub.id} className="hover:bg-secondary/30 transition-colors">
              <td className="px-4 py-3 text-sm text-foreground">{sub.userEmail}</td>
              <td className="px-4 py-3 text-sm text-muted-foreground capitalize">{sub.plan.replace("_", " ")}</td>
              <td className="px-4 py-3 text-sm text-muted-foreground">{sub.amount.toLocaleString()} {sub.currency}</td>
              <td className="px-4 py-3 text-sm text-muted-foreground">{new Date(sub.expiresAt).toLocaleDateString()}</td>
              <td className="px-4 py-3">
                <span className={`px-2 py-0.5 text-xs rounded-full ${sub.isActive ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"}`}>
                  {sub.isActive ? "Active" : "Inactive"}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => onToggle(sub)} 
                    className="text-xs text-primary hover:underline"
                  >
                    {sub.isActive ? "Deactivate" : "Activate"}
                  </button>
                  <span className="text-muted-foreground">|</span>
                  <button 
                    onClick={() => onChangePlan(sub)} 
                    className="text-xs text-primary hover:underline"
                  >
                    Change Plan
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    {subscriptions.length === 0 && (
      <div className="text-center py-12 text-muted-foreground">No subscriptions found.</div>
    )}
  </div>
);

// Wallet View Component
const WalletView = ({ wallet, transactions: firebaseTransactions, totalRevenue }: { 
  wallet: WalletData; 
  transactions: Transaction[];
  totalRevenue: number;
}) => {
  const [apiBalance, setApiBalance] = useState<number | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(true);
  const [balanceError, setBalanceError] = useState<string | null>(null);
  const [apiTransactions, setApiTransactions] = useState<BackendTransaction[]>([]);
  const [txLoading, setTxLoading] = useState(true);
  const [txPage, setTxPage] = useState(1);
  const [txTotalPages, setTxTotalPages] = useState(1);
  const [txTotalCount, setTxTotalCount] = useState(0);

  const fetchData = async (page: number = 1) => {
    try {
      setBalanceLoading(true);
      setTxLoading(true);
      setBalanceError(null);

      const [balRes, txRes] = await Promise.all([
        fetch("https://function-bun-production-0c2c.up.railway.app/api/wallet/balance"),
        fetchBackendTransactions(page),
      ]);

      const balData = await balRes.json();
      if (balData.balance !== undefined) {
        setApiBalance(balData.balance);
      } else if (balData.relworx?.balance !== undefined) {
        setApiBalance(balData.relworx.balance);
      } else {
        setBalanceError("Could not retrieve balance");
      }

      // Handle both direct and relworx-wrapped response formats
      const txData = txRes.relworx || txRes;
      if (txRes.success && (txData as any)?.transactions) {
        setApiTransactions((txData as any).transactions);
        setTxTotalPages((txData as any).total_pages || 1);
        setTxTotalCount((txData as any).total_count || 0);
        setTxPage((txData as any).current_page || page);
      }
    } catch (error) {
      console.error("Failed to fetch wallet data:", error);
      setBalanceError("Failed to load data");
    } finally {
      setBalanceLoading(false);
      setTxLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePageChange = async (page: number) => {
    setTxLoading(true);
    try {
      const txRes = await fetchBackendTransactions(page);
      const txData = txRes.relworx || txRes;
      if (txRes.success && (txData as any)?.transactions) {
        setApiTransactions((txData as any).transactions);
        setTxTotalPages((txData as any).total_pages || 1);
        setTxTotalCount((txData as any).total_count || 0);
        setTxPage((txData as any).current_page || page);
      }
    } catch (error) {
      console.error("Failed to fetch page:", error);
    } finally {
      setTxLoading(false);
    }
  };

  const displayBalance = apiBalance !== null ? apiBalance : wallet.balance;

  // Calculate revenue from API transactions (successful collections)
  const apiRevenue = apiTransactions
    .filter(tx => tx.transaction_type === "collection" && tx.status === "success")
    .reduce((sum, tx) => sum + tx.amount, 0);

  return (
  <div className="space-y-6">
    {/* Stats */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/20 rounded-lg">
            <Wallet className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Current Balance</p>
            {balanceLoading ? (
              <p className="text-2xl font-bold text-muted-foreground">Loading...</p>
            ) : balanceError ? (
              <p className="text-sm text-destructive">{balanceError}</p>
            ) : (
              <p className="text-2xl font-bold text-foreground">{displayBalance.toLocaleString()} UGX</p>
            )}
          </div>
        </div>
      </div>
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-green-500/20 rounded-lg">
            <TrendingUp className="w-6 h-6 text-green-500" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Transactions</p>
            <p className="text-2xl font-bold text-foreground">{txTotalCount}</p>
          </div>
        </div>
      </div>
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-500/20 rounded-lg">
            <RefreshCw 
              className={`w-6 h-6 text-blue-500 cursor-pointer hover:text-blue-400 transition-colors ${txLoading ? 'animate-spin' : ''}`} 
              onClick={() => fetchData(txPage)} 
            />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Successful Collections</p>
            <p className="text-2xl font-bold text-foreground">
              {apiTransactions.filter(tx => tx.transaction_type === "collection" && tx.status === "success").length}
            </p>
          </div>
        </div>
      </div>
    </div>

    {/* Real Transactions from Backend */}
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Payment Transactions (Live)</h3>
        <span className="text-xs text-muted-foreground">Page {txPage} of {txTotalPages} • {txTotalCount} total</span>
      </div>
      {txLoading ? (
        <div className="text-center py-12 text-muted-foreground">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
          Loading transactions...
        </div>
      ) : (
      <>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-secondary/50">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Type</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Reference</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Phone</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Provider</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Amount</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Status</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {apiTransactions.map((tx) => (
              <tr key={tx.customer_reference} className="hover:bg-secondary/30 transition-colors">
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 text-xs rounded-full capitalize ${tx.transaction_type === "collection" ? "bg-green-500/20 text-green-500" : "bg-orange-500/20 text-orange-500"}`}>
                    {tx.transaction_type === "collection" ? "Payment" : "Payout"}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground font-mono">{tx.customer_reference.slice(-8)}</td>
                <td className="px-4 py-3 text-sm text-foreground">{tx.msisdn}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{tx.provider.replace("_", " ")}</td>
                <td className="px-4 py-3 text-sm text-foreground font-medium">{tx.amount.toLocaleString()} {tx.currency}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 text-xs rounded-full capitalize ${
                    tx.status === "success" ? "bg-green-500/20 text-green-500" 
                    : tx.status === "pending" || tx.status === "processing" ? "bg-yellow-500/20 text-yellow-500" 
                    : "bg-red-500/20 text-red-500"
                  }`}>
                    {tx.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{new Date(tx.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {apiTransactions.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">No transactions found.</div>
      )}
      {/* Pagination */}
      {txTotalPages > 1 && (
        <div className="flex items-center justify-center gap-2 py-3 border-t border-border">
          <button
            onClick={() => handlePageChange(txPage - 1)}
            disabled={txPage <= 1}
            className="px-3 py-1.5 text-xs bg-secondary/50 border border-border rounded hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          {Array.from({ length: txTotalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => handlePageChange(p)}
              className={`px-3 py-1.5 text-xs rounded transition-colors ${
                p === txPage 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-secondary/50 border border-border hover:bg-secondary"
              }`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => handlePageChange(txPage + 1)}
            disabled={txPage >= txTotalPages}
            className="px-3 py-1.5 text-xs bg-secondary/50 border border-border rounded hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
      </>
      )}
    </div>
  </div>
  );
};

// Add Content Modal
const AddContentModal = ({ open, onOpenChange, type, initialData, onSave }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "movie" | "series";
  initialData?: FirebaseMovie;
  onSave: (data: Omit<FirebaseMovie, "id">) => void;
}) => {
  const [title, setTitle] = useState(initialData?.title || "");
  const [image, setImage] = useState(initialData?.image || "");
  const [streamlink, setStreamlink] = useState(initialData?.streamlink || "");
  const [category, setCategory] = useState(initialData?.category || "");
  const [year, setYear] = useState(initialData?.year?.toString() || "2024");
  const [rating, setRating] = useState(initialData?.rating?.toString() || "7.5");
  const [description, setDescription] = useState(initialData?.description || "");
  const [isPopular, setIsPopular] = useState(initialData?.isPopular || false);
  const [isTrending, setIsTrending] = useState(initialData?.isTrending || false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setImage(initialData.image || "");
      setStreamlink(initialData.streamlink || "");
      setCategory(initialData.category || "");
      setYear(initialData.year?.toString() || "2024");
      setRating(initialData.rating?.toString() || "7.5");
      setDescription(initialData.description || "");
      setIsPopular(initialData.isPopular || false);
      setIsTrending(initialData.isTrending || false);
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return toast.error("Title is required");

    setLoading(true);
    try {
      await onSave({
        title,
        image,
        streamlink,
        category,
        year: parseInt(year),
        rating: parseFloat(rating),
        description,
        isPopular,
        isTrending,
        type,
        episodes: initialData?.episodes || [],
      });
    } catch (error) {
      toast.error("Failed to save");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit" : "Add"} {type === "movie" ? "Movie" : "Series"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="Enter title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Poster Image URL</label>
            <input
              type="url"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="https://..."
            />
          </div>
          {type === "movie" && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Stream Link (Google Drive)</label>
              <input
                type="url"
                value={streamlink}
                onChange={(e) => setStreamlink(e.target.value)}
                className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="https://drive.google.com/..."
              />
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Category</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="Action"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Year</label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Rating (1-10)</label>
            <input
              type="number"
              step="0.1"
              min="1"
              max="10"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              placeholder="Brief description..."
            />
          </div>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isPopular}
                onChange={(e) => setIsPopular(e.target.checked)}
                className="w-4 h-4 rounded border-border"
              />
              <span className="text-sm text-foreground">Mark as Popular</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isTrending}
                onChange={(e) => setIsTrending(e.target.checked)}
                className="w-4 h-4 rounded border-border"
              />
              <span className="text-sm text-foreground">Mark as Trending</span>
            </label>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Add Episode Modal
const AddEpisodeModal = ({ open, onOpenChange, series, onSave }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  series: FirebaseMovie | null;
  onSave: (episode: Episode) => void;
}) => {
  const [episodeNumber, setEpisodeNumber] = useState("1");
  const [title, setTitle] = useState("");
  const [streamlink, setStreamlink] = useState("");
  const [season, setSeason] = useState("1");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !streamlink) return toast.error("Title and stream link are required");

    setLoading(true);
    try {
      await onSave({
        episodeNumber: parseInt(episodeNumber),
        title,
        streamlink,
        season: parseInt(season),
      });
      setTitle("");
      setStreamlink("");
      setEpisodeNumber("1");
    } catch (error) {
      toast.error("Failed to add episode");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Episode to {series?.title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Season</label>
              <input
                type="number"
                min="1"
                value={season}
                onChange={(e) => setSeason(e.target.value)}
                className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Episode #</label>
              <input
                type="number"
                min="1"
                value={episodeNumber}
                onChange={(e) => setEpisodeNumber(e.target.value)}
                className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Episode Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="Episode title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Stream Link *</label>
            <input
              type="url"
              value={streamlink}
              onChange={(e) => setStreamlink(e.target.value)}
              className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="https://drive.google.com/..."
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {loading ? "Adding..." : "Add Episode"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Add Subscription Modal
const AddSubscriptionModal = ({ open, onOpenChange, users, onSave }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  users: FirebaseUser[];
  onSave: (data: Omit<Subscription, "id">) => void;
}) => {
  const [userId, setUserId] = useState("");
  const [plan, setPlan] = useState("1_month");
  const [amount, setAmount] = useState("5000");
  const [loading, setLoading] = useState(false);

  const selectedUser = users.find(u => u.uid === userId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return toast.error("Please select a user");

    const now = new Date();
    const expiresAt = new Date();
    
    switch (plan) {
      case "1_day": expiresAt.setDate(now.getDate() + 1); break;
      case "3_days": expiresAt.setDate(now.getDate() + 3); break;
      case "1_week": expiresAt.setDate(now.getDate() + 7); break;
      case "1_month": expiresAt.setMonth(now.getMonth() + 1); break;
      case "annual": expiresAt.setFullYear(now.getFullYear() + 1); break;
    }

    setLoading(true);
    try {
      await onSave({
        userId,
        userEmail: selectedUser?.email || "",
        plan,
        amount: parseInt(amount),
        currency: "UGX",
        startsAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
        isActive: true,
        createdAt: now.toISOString(),
      });
    } catch (error) {
      toast.error("Failed to add subscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Subscription</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">User *</label>
            <select
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="">Select a user</option>
              {users.map((u) => (
                <option key={u.uid} value={u.uid}>{u.email}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Plan *</label>
            <select
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
              className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="1_day">1 Day</option>
              <option value="3_days">3 Days</option>
              <option value="1_week">1 Week</option>
              <option value="1_month">1 Month</option>
              <option value="annual">Annual</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Amount (UGX) *</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {loading ? "Adding..." : "Add Subscription"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Withdraw Modal with Mobile Money integration
const WithdrawModal = ({ open, onOpenChange, wallet, adminEmail, onWithdraw }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  wallet: WalletData;
  adminEmail: string;
  onWithdraw: (request: WithdrawRequest) => Promise<void>;
}) => {
  const [amount, setAmount] = useState("");
  const [phone, setPhone] = useState("");
  const [provider, setProvider] = useState<"mtn" | "airtel">("mtn");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"form" | "processing" | "success">("form");
  const [apiBalance, setApiBalance] = useState<number | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(true);

  // Fetch real balance from API when modal opens
  useEffect(() => {
    if (open) {
      const fetchBalance = async () => {
        try {
          setBalanceLoading(true);
          setApiBalance(null); // Reset before fetching
          const response = await fetch("https://function-bun-production-0c2c.up.railway.app/api/wallet/balance");
          const data = await response.json();
          console.log("Withdraw modal - Wallet balance response:", data);
          
          // Check for balance in response - try multiple locations
          let balance: number | null = null;
          if (data.success) {
            if (typeof data.balance === 'number') {
              balance = data.balance;
            } else if (typeof data.relworx?.balance === 'number') {
              balance = data.relworx.balance;
            }
          }
          
          if (balance !== null) {
            console.log("Setting API balance to:", balance);
            setApiBalance(balance);
          } else {
            console.error("Could not parse balance from response:", data);
            toast.error("Could not load wallet balance");
          }
        } catch (error) {
          console.error("Failed to fetch wallet balance:", error);
          toast.error("Failed to load wallet balance");
        } finally {
          setBalanceLoading(false);
        }
      };
      fetchBalance();
    }
  }, [open]);

  const displayBalance = apiBalance !== null ? apiBalance : wallet.balance;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Ensure balance is loaded before allowing withdrawal
    if (balanceLoading) {
      return toast.error("Please wait, loading balance...");
    }
    
    const numAmount = parseInt(amount);
    
    if (!numAmount || numAmount <= 0) return toast.error("Enter a valid amount");
    if (numAmount < 500) return toast.error("Minimum withdrawal amount is 500 UGX");
    if (apiBalance === null) return toast.error("Could not verify balance. Please try again.");
    if (numAmount > displayBalance) return toast.error(`Insufficient balance. Available: ${displayBalance.toLocaleString()} UGX`);
    if (!phone || phone.length < 10) return toast.error("Enter a valid phone number");
    
    // Validate phone format for Uganda
    const cleanPhone = phone.replace(/\D/g, "");
    if (!cleanPhone.match(/^(0?7[0-9]{8}|256[0-9]{9})$/)) {
      return toast.error("Enter a valid Ugandan phone number");
    }

    setLoading(true);
    setStep("processing");
    
    try {
      await onWithdraw({
        amount: numAmount,
        phone: cleanPhone,
        provider,
        adminEmail,
      });
      setStep("success");
      
      // Refetch the balance from API after successful withdrawal
      try {
        const balRes = await fetch("https://function-bun-production-0c2c.up.railway.app/api/wallet/balance");
        const balData = await balRes.json();
        const newBalance = typeof balData?.balance === 'number'
          ? balData.balance
          : typeof balData?.relworx?.balance === 'number'
            ? balData.relworx.balance
            : null;
        if (newBalance !== null) {
          setApiBalance(newBalance);
        }
      } catch (e) {
        console.error("Failed to refresh balance after withdrawal:", e);
      }
      
      setTimeout(() => {
        setAmount("");
        setPhone("");
        setStep("form");
      }, 2000);
    } catch (error: any) {
      toast.error(error.message || "Failed to withdraw");
      setStep("form");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => {
      if (!loading) {
        onOpenChange(o);
        if (!o) setStep("form");
      }
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-primary" />
            Withdraw via Mobile Money
          </DialogTitle>
        </DialogHeader>
        
        {step === "processing" && (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 mx-auto border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-foreground font-medium">Processing withdrawal...</p>
            <p className="text-sm text-muted-foreground">
              Sending {parseInt(amount).toLocaleString()} UGX to {phone} via {provider.toUpperCase()}
            </p>
          </div>
        )}
        
        {step === "success" && (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-green-500/20 rounded-full flex items-center justify-center">
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
            <p className="text-foreground font-medium">Withdrawal Successful!</p>
            <p className="text-sm text-muted-foreground">
              {parseInt(amount).toLocaleString()} UGX sent to {phone}
            </p>
          </div>
        )}
        
        {step === "form" && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Balance Display */}
            <div className="p-4 bg-secondary/50 rounded-lg text-center">
              <p className="text-sm text-muted-foreground">Available Balance</p>
              {balanceLoading ? (
                <p className="text-2xl font-bold text-muted-foreground">Loading...</p>
              ) : (
                <p className="text-2xl font-bold text-foreground">{displayBalance.toLocaleString()} UGX</p>
              )}
            </div>
            
            {/* Provider Selection */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Select Provider *</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setProvider("mtn")}
                  className={`p-3 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
                    provider === "mtn" 
                      ? "border-yellow-500 bg-yellow-500/10" 
                      : "border-border hover:border-yellow-500/50"
                  }`}
                >
                  <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-black">MTN</span>
                  </div>
                  <span className="font-medium text-foreground">MTN MoMo</span>
                </button>
                <button
                  type="button"
                  onClick={() => setProvider("airtel")}
                  className={`p-3 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
                    provider === "airtel" 
                      ? "border-red-500 bg-red-500/10" 
                      : "border-border hover:border-red-500/50"
                  }`}
                >
                  <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-white">A</span>
                  </div>
                  <span className="font-medium text-foreground">Airtel Money</span>
                </button>
              </div>
            </div>
            
            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Phone Number *</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="e.g. 0771234567"
              />
              <p className="text-xs text-muted-foreground mt-1">Enter your {provider.toUpperCase()} registered number</p>
            </div>
            
            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Amount to Withdraw *</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min={500}
                max={displayBalance}
                className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="Enter amount in UGX (min 500)"
              />
              <p className="text-xs text-muted-foreground mt-1">Minimum: 500 UGX | Maximum: {displayBalance.toLocaleString()} UGX</p>
            </div>
            
            {/* Quick Amount Buttons */}
            <div className="flex gap-2">
              {[1000, 5000, 10000].map((quickAmount) => (
                <button
                  key={quickAmount}
                  type="button"
                  onClick={() => setAmount(String(Math.min(quickAmount, displayBalance)))}
                  disabled={quickAmount > displayBalance || balanceLoading}
                  className="flex-1 px-2 py-1.5 text-xs bg-secondary/50 border border-border rounded hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {quickAmount.toLocaleString()}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setAmount(String(displayBalance))}
                disabled={balanceLoading}
                className="flex-1 px-2 py-1.5 text-xs bg-primary/20 border border-primary/30 text-primary rounded hover:bg-primary/30 transition-colors disabled:opacity-50"
              >
                Max
              </button>
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {loading ? "Processing..." : "Withdraw"}
              </button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

// Manage Episodes Modal
const ManageEpisodesModal = ({ open, onOpenChange, series, onUpdateEpisode, onDeleteEpisode }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  series: FirebaseMovie | null;
  onUpdateEpisode: (seriesId: string, index: number, data: Partial<Episode>) => Promise<void>;
  onDeleteEpisode: (seriesId: string, index: number) => Promise<void>;
}) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editStreamlink, setEditStreamlink] = useState("");
  const [editSeason, setEditSeason] = useState("1");
  const [editEpisodeNumber, setEditEpisodeNumber] = useState("1");

  const episodes = series?.episodes || [];

  const startEdit = (index: number) => {
    const ep = episodes[index];
    setEditingIndex(index);
    setEditTitle(ep.title);
    setEditStreamlink(ep.streamlink);
    setEditSeason(String(ep.season || 1));
    setEditEpisodeNumber(String(ep.episodeNumber));
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditTitle("");
    setEditStreamlink("");
  };

  const saveEdit = async () => {
    if (!series || editingIndex === null) return;
    await onUpdateEpisode(series.id, editingIndex, {
      title: editTitle,
      streamlink: editStreamlink,
      season: parseInt(editSeason),
      episodeNumber: parseInt(editEpisodeNumber),
    });
    cancelEdit();
  };

  const handleDelete = async (index: number) => {
    if (!series) return;
    if (window.confirm("Are you sure you want to delete this episode?")) {
      await onDeleteEpisode(series.id, index);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Manage Episodes - {series?.title}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto">
          {episodes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No episodes yet. Add some from the series table.
            </div>
          ) : (
            <div className="space-y-2">
              {episodes.map((ep, index) => (
                <div key={index} className="p-3 bg-secondary/30 rounded-lg">
                  {editingIndex === index ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="number"
                          value={editSeason}
                          onChange={(e) => setEditSeason(e.target.value)}
                          className="px-2 py-1.5 bg-background border border-border rounded text-sm"
                          placeholder="Season"
                        />
                        <input
                          type="number"
                          value={editEpisodeNumber}
                          onChange={(e) => setEditEpisodeNumber(e.target.value)}
                          className="px-2 py-1.5 bg-background border border-border rounded text-sm"
                          placeholder="Episode #"
                        />
                      </div>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full px-2 py-1.5 bg-background border border-border rounded text-sm"
                        placeholder="Episode title"
                      />
                      <input
                        type="url"
                        value={editStreamlink}
                        onChange={(e) => setEditStreamlink(e.target.value)}
                        className="w-full px-2 py-1.5 bg-background border border-border rounded text-sm"
                        placeholder="Stream URL"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={cancelEdit}
                          className="px-3 py-1 text-xs text-muted-foreground hover:text-foreground"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={saveEdit}
                          className="px-3 py-1 bg-primary text-primary-foreground text-xs rounded"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs text-muted-foreground mr-2">
                          S{ep.season || 1}E{ep.episodeNumber}
                        </span>
                        <span className="text-sm font-medium text-foreground">{ep.title}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => startEdit(index)}
                          className="p-1.5 text-muted-foreground hover:text-foreground"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(index)}
                          className="p-1.5 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// User Subscription Modal - Activate subscription for a user
const UserSubscriptionModal = ({ open, onOpenChange, user, existingSubscriptions, onSave }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: FirebaseUser | null;
  existingSubscriptions: Subscription[];
  onSave: (data: Omit<Subscription, "id">) => Promise<void>;
}) => {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [loading, setLoading] = useState(false);

  // Find user's existing active subscription
  const existingSub = user ? existingSubscriptions.find(sub => 
    sub.userId === user.uid && 
    sub.isActive && 
    new Date(sub.expiresAt) > new Date()
  ) : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan || !user) return;

    setLoading(true);
    try {
      const now = new Date();
      const expiresAt = new Date(now);
      expiresAt.setDate(expiresAt.getDate() + selectedPlan.days);

      await onSave({
        userId: user.uid,
        userEmail: user.email,
        plan: selectedPlan.id,
        planName: selectedPlan.name,
        amount: selectedPlan.price,
        currency: selectedPlan.currency,
        startsAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
        isActive: true,
        createdAt: now.toISOString(),
      });
      setSelectedPlan(null);
    } catch (error) {
      toast.error("Failed to activate subscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-primary" />
            {existingSub ? "Change Subscription Plan" : "Activate Subscription"}
          </DialogTitle>
        </DialogHeader>
        
        {user && (
          <div className="space-y-4">
            {/* User Info */}
            <div className="p-3 bg-secondary/50 rounded-lg">
              <p className="text-sm font-medium text-foreground">{user.displayName || "Unknown"}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
              {existingSub && (
                <p className="text-xs text-primary mt-1">
                  Current: {existingSub.plan.replace("_", " ")} (expires {new Date(existingSub.expiresAt).toLocaleDateString()})
                </p>
              )}
            </div>

            {/* Plan Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Select Plan</label>
              <div className="grid grid-cols-2 gap-2">
                {SUBSCRIPTION_PLANS.map((plan) => (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => setSelectedPlan(plan)}
                    className={`p-3 rounded-lg border-2 transition-all text-left ${
                      selectedPlan?.id === plan.id
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <p className="text-sm font-medium text-foreground">{plan.name}</p>
                    <p className="text-lg font-bold text-primary">{plan.price.toLocaleString()} UGX</p>
                    <p className="text-xs text-muted-foreground">{plan.duration}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!selectedPlan || loading}
                className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {loading ? "Processing..." : existingSub ? "Change Plan" : "Activate"}
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

// Edit Subscription Modal - Change/upgrade/downgrade existing subscription
const EditSubscriptionModal = ({ open, onOpenChange, subscription, onSave }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subscription: Subscription | null;
  onSave: (subId: string, data: Partial<Subscription>) => Promise<void>;
}) => {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [loading, setLoading] = useState(false);

  // Reset selection when subscription changes
  useEffect(() => {
    if (subscription) {
      const currentPlan = SUBSCRIPTION_PLANS.find(p => p.id === subscription.plan);
      setSelectedPlan(currentPlan || null);
    }
  }, [subscription]);

  const handleSubmit = async () => {
    if (!selectedPlan || !subscription) return;

    setLoading(true);
    try {
      // Calculate new expiry based on selected plan
      const now = new Date();
      const expiresAt = new Date(now);
      expiresAt.setDate(expiresAt.getDate() + selectedPlan.days);

      await onSave(subscription.id, {
        plan: selectedPlan.id,
        planName: selectedPlan.name,
        amount: selectedPlan.price,
        expiresAt: expiresAt.toISOString(),
      });
      setSelectedPlan(null);
    } catch (error) {
      toast.error("Failed to update subscription");
    } finally {
      setLoading(false);
    }
  };

  const currentPlan = subscription ? SUBSCRIPTION_PLANS.find(p => p.id === subscription.plan) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-primary" />
            Change Subscription Plan
          </DialogTitle>
        </DialogHeader>
        
        {subscription && (
          <div className="space-y-4">
            {/* Current Subscription Info */}
            <div className="p-3 bg-secondary/50 rounded-lg">
              <p className="text-sm font-medium text-foreground">{subscription.userEmail}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-muted-foreground">Current:</span>
                <span className="px-2 py-0.5 text-xs rounded-full bg-primary/20 text-primary">
                  {subscription.plan.replace("_", " ")}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Expires: {new Date(subscription.expiresAt).toLocaleDateString()}
              </p>
            </div>

            {/* Plan Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Select New Plan</label>
              <div className="grid grid-cols-2 gap-2">
                {SUBSCRIPTION_PLANS.map((plan) => {
                  const isUpgrade = currentPlan && plan.price > currentPlan.price;
                  const isDowngrade = currentPlan && plan.price < currentPlan.price;
                  const isCurrent = plan.id === subscription.plan;
                  
                  return (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => setSelectedPlan(plan)}
                      disabled={isCurrent}
                      className={`p-3 rounded-lg border-2 transition-all text-left relative ${
                        selectedPlan?.id === plan.id
                          ? "border-primary bg-primary/10"
                          : isCurrent
                            ? "border-muted bg-muted/30 opacity-60"
                            : "border-border hover:border-primary/50"
                      }`}
                    >
                      {isUpgrade && !isCurrent && (
                        <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 bg-green-500 text-white text-[10px] font-bold rounded-full">
                          ↑
                        </span>
                      )}
                      {isDowngrade && !isCurrent && (
                        <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 bg-orange-500 text-white text-[10px] font-bold rounded-full">
                          ↓
                        </span>
                      )}
                      <p className="text-sm font-medium text-foreground">{plan.name}</p>
                      <p className="text-lg font-bold text-primary">{plan.price.toLocaleString()} UGX</p>
                      <p className="text-xs text-muted-foreground">{plan.duration}</p>
                      {isCurrent && (
                        <p className="text-[10px] text-primary mt-1">Current Plan</p>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!selectedPlan || selectedPlan.id === subscription.plan || loading}
                className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {loading ? "Updating..." : "Update Plan"}
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default Admin;
