import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Check, X, Trash2, Percent, Users } from "lucide-react";
import {
  Agent,
  Subscription,
  subscribeToAgents,
  subscribeToSubscriptions,
  updateAgent,
  deleteAgent,
} from "@/lib/firebase";

const statusStyles: Record<string, string> = {
  pending: "bg-yellow-500/15 text-yellow-600",
  approved: "bg-green-500/15 text-green-600",
  rejected: "bg-red-500/15 text-red-500",
  suspended: "bg-muted text-muted-foreground",
};

const AgentsAdmin = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);

  useEffect(() => {
    const unsubA = subscribeToAgents(setAgents);
    const unsubS = subscribeToSubscriptions(setSubscriptions);
    return () => {
      unsubA();
      unsubS();
    };
  }, []);

  const salesFor = (agent: Agent) =>
    subscriptions.filter(
      (s) => s.agentId === agent.id || s.agentCode?.toUpperCase() === agent.code?.toUpperCase()
    );

  const setStatus = async (agent: Agent, status: Agent["status"]) => {
    await updateAgent(agent.id, {
      status,
      ...(status === "approved" ? { approvedAt: new Date().toISOString() } : {}),
    });
    toast.success(`Agent ${status}`);
  };

  const pending = agents.filter((a) => a.status === "pending");

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Total Agents" value={agents.length} />
        <StatCard label="Pending" value={pending.length} />
        <StatCard label="Approved" value={agents.filter((a) => a.status === "approved").length} />
        <StatCard
          label="Agent Sales"
          value={agents.reduce((acc, a) => acc + salesFor(a).length, 0)}
        />
      </div>

      {agents.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Users className="w-10 h-10 mx-auto mb-3 opacity-50" />
          No agent applications yet.
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50 text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Agent</th>
                <th className="text-left px-4 py-3 font-medium">Contact</th>
                <th className="text-left px-4 py-3 font-medium">Code</th>
                <th className="text-left px-4 py-3 font-medium">Commission</th>
                <th className="text-left px-4 py-3 font-medium">Sales</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-right px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {agents.map((agent) => {
                const sales = salesFor(agent);
                const earnings = sales.reduce(
                  (acc, s) => acc + (s.amount * (agent.commissionRate ?? 0)) / 100,
                  0
                );
                return (
                  <tr key={agent.id} className="border-t border-border">
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{agent.displayName}</p>
                      <p className="text-xs text-muted-foreground">{agent.location}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-foreground">{agent.phone}</p>
                      <p className="text-xs text-muted-foreground">{agent.email}</p>
                    </td>
                    <td className="px-4 py-3 font-mono text-primary">{agent.code}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          defaultValue={agent.commissionRate ?? 0}
                          onBlur={async (e) => {
                            const value = Number(e.target.value);
                            if (Number.isNaN(value) || value === agent.commissionRate) return;
                            await updateAgent(agent.id, { commissionRate: value });
                            toast.success("Commission updated");
                          }}
                          className="w-16 px-2 py-1 bg-secondary/50 border border-border rounded-lg text-foreground"
                        />
                        <Percent className="w-3.5 h-3.5 text-muted-foreground" />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-foreground">{sales.length}</p>
                      <p className="text-xs text-muted-foreground">
                        {Math.round(earnings).toLocaleString()} UGX
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-lg text-xs font-medium ${
                          statusStyles[agent.status] || statusStyles.pending
                        }`}
                      >
                        {agent.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        {agent.status !== "approved" && (
                          <button
                            onClick={() => setStatus(agent, "approved")}
                            title="Approve"
                            className="p-1.5 rounded-lg text-green-600 hover:bg-secondary"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        {agent.status !== "suspended" && agent.status === "approved" && (
                          <button
                            onClick={() => setStatus(agent, "suspended")}
                            title="Suspend"
                            className="p-1.5 rounded-lg text-muted-foreground hover:bg-secondary"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                        {agent.status === "pending" && (
                          <button
                            onClick={() => setStatus(agent, "rejected")}
                            title="Reject"
                            className="p-1.5 rounded-lg text-red-500 hover:bg-secondary"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={async () => {
                            await deleteAgent(agent.id);
                            toast.success("Agent removed");
                          }}
                          title="Delete"
                          className="p-1.5 rounded-lg text-red-500 hover:bg-secondary"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ label, value }: { label: string; value: number }) => (
  <div className="bg-card border border-border rounded-xl p-4">
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className="text-2xl font-bold text-foreground">{value.toLocaleString()}</p>
  </div>
);

export default AgentsAdmin;
