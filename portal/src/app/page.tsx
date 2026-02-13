"use client";

import React, { useState, useEffect } from "react";
import {
  Activity,
  ShieldAlert,
  Users,
  Cpu,
  RotateCcw,
  ShieldCheck,
  Key,
  Lock
} from "lucide-react";
import { motion } from "framer-motion";
import { useNetworkDiscovery } from "@/hooks/useNetworkDiscovery";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { StatCard } from "@/components/dashboard/StatCard";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { NodeMatrix } from "@/components/network/NodeMatrix";
import { AuditMatrix } from "@/components/network/AuditMatrix";
import { TopologyMap } from "@/components/network/TopologyMap";
import { ProvisionPanel } from "@/components/network/ProvisionPanel";
import { OnboardingModal } from "@/components/network/OnboardingModal";
import { FirewallPanel } from "@/components/network/FirewallPanel";
import { AnalyticsDashboard } from "@/components/dashboard/AnalyticsDashboard";
import { UserAccessPanel } from "@/components/network/UserAccessPanel";
import { OnboardingData } from "@/lib/types/network";
import { useFirewall } from "@/hooks/useFirewall";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useAuth } from "@/hooks/useAuth";
import { LoginPage } from "@/components/auth/LoginPage";
import { translations } from "@/lib/translations";
import { formatBytes } from "@/lib/utils";
import { GatewayMatrix } from "@/components/network/GatewayMatrix";
import { TacticalMap } from "@/components/dashboard/TacticalMap";
import { useGateways } from "@/hooks/useGateways";
import { useUsers } from "@/hooks/useUsers";
import { UserMatrixEnhanced as UserMatrix } from "@/components/network/UserMatrixEnhanced";
import { NotificationsPage } from "@/components/notifications/NotificationsPage";
import { OrganizationsPage } from "@/components/organizations/OrganizationsPage";
import api from "@/lib/axios";
import { SetupWizard } from "@/components/network/SetupWizard";
import StrategicOutreach from "@/components/network/StrategicOutreach";

const t = translations.th;

export default function EnterpriseDashboard() {
  const { user, isAuthenticated, login, logout, loading: authLoading } = useAuth();
  const { peers, auditLogs, loading, error, refresh, handleRevoke, handleRotate, handleUpdate, handleDelete, rotateAll, createPeer } = useNetworkDiscovery();
  const { rules, loading: fwLoading, addRule, deleteRule } = useFirewall();
  const { nodes, loading: nodesLoading, refresh: refreshNodes, createNode, updateNode, deleteNode, syncNode } = useGateways();
  const { users, loading: usersLoading, refresh: refreshUsers, createUser, updateUser, deleteUser } = useUsers();
  const { data: analyticsData, nodeData, loading: analyticsLoading } = useAnalytics();

  const [needsSetup, setNeedsSetup] = useState<boolean | null>(null);

  useEffect(() => {
    checkSetupStatus();
  }, []);

  const checkSetupStatus = async () => {
    try {
      const res = await api.get("/api/v1/setup/status");
      setNeedsSetup(!res.data.initialized);
    } catch (err) {
      console.error("Setup status check failed");
      setNeedsSetup(false);
    }
  };

  // Persistence Layer: Use URL Hash for navigation state
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash.replace("#", "");
      return hash || "my-access";
    }
    return "my-access";
  });

  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null);

  // Sync state to URL hash
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.location.hash = activeTab;
    }
  }, [activeTab]);

  // Handle browser back/forward navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "");
      if (hash) setActiveTab(hash);
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const role = user?.role || "user";
  const isRoot = role === 'root';
  const isAdmin = role === 'admin' || isRoot;
  const isStaff = role === 'staff' || isAdmin || isRoot;

  if (authLoading || needsSetup === null) return null;

  if (needsSetup) {
    return <SetupWizard onComplete={() => setNeedsSetup(false)} />;
  }

  if (!isAuthenticated) return <LoginPage onLogin={login} />;

  const handleRotateAllMaster = async () => {
    if (!confirm("🚨 คำเตือนความมั่นคงสูง: คุณกำลังจะรีเซ็ตกุญแจเข้ารหัสของทุกอุปกรณ์ในระบบ ระบบจะตัดการเชื่อมต่อทั้งหมดจนกว่าจะได้รับการอัปเดตกุญแจใหม่ ยืนยันหรือไม่?")) return;
    try {
      await rotateAll();
      alert("หมุนเวียนกุญแจสำเร็จ: ทุกโหนดได้รับการเปลี่ยน identity ใหม่แล้ว");
    } catch (err) {
      alert("การหมุนเวียนกุญแจล้มเหลว");
    }
  };

  const handleProvision = async (username: string) => {
    try {
      const data = await createPeer(username);
      setOnboardingData(data);
    } catch (err) {
      alert(t.provision.failure + " " + username);
    }
  };

  const handleRotateMaster = async (id: number) => {
    try {
      const data = await handleRotate(id);
      setOnboardingData(data);
    } catch (err) {
      alert("Encryption rotation failed");
    }
  };

  const handleBatchMigrate = async (peerIds: number[], targetNodeId: number) => {
    try {
      await api.post("/api/v1/peers/batch-migrate", { peer_ids: peerIds, target_node_id: targetNodeId });
      refresh();
      alert("Strategic Migration Complete: Identity Vectors Re-routed");
    } catch (err) {
      alert("Migration Failed: Mission Integrity Compromised");
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "my-access":
        return <UserAccessPanel />;
      case "users":
        return isStaff ? (
          <UserMatrix
            users={users}
            loading={usersLoading}
            onRefresh={refreshUsers}
            onCreate={createUser}
            onUpdate={updateUser}
            onDelete={deleteUser}
            currentUserRole={role}
          />
        ) : null;
      case "gateways":
        return isAdmin ? (
          <div className="space-y-8">
            <TacticalMap nodes={nodes} />
            <GatewayMatrix
              nodes={nodes}
              loading={nodesLoading}
              onRefresh={refreshNodes}
              onCreate={createNode}
              onUpdate={updateNode}
              onDelete={deleteNode}
              onSync={syncNode}
            />
          </div>
        ) : null;
      case "nodes":
        return isStaff ? (
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            <div className="xl:col-span-3">
              <NodeMatrix
                peers={peers}
                loading={loading}
                onRefresh={refresh}
                onRevoke={handleRevoke}
                onRotate={handleRotateMaster}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
                onMigrate={handleBatchMigrate}
                availableNodes={nodes}
              />
            </div>
            <div className="xl:col-span-1 space-y-6">
              <ProvisionPanel onProvision={handleProvision} />
            </div>
          </div>
        ) : null;
      case "logs":
        return isAdmin ? <AuditMatrix logs={auditLogs} /> : null;
      case "map":
        return isStaff ? <TopologyMap peers={peers} /> : null;
      case "analytics":
        return isAdmin ? <AnalyticsDashboard data={analyticsData} nodeData={nodeData} loading={analyticsLoading} /> : null;
      case "policy":
        return isAdmin ? <FirewallPanel rules={rules} onAdd={addRule} onDelete={deleteRule} loading={fwLoading} /> : null;
      case "keys":
        return isAdmin ? (
          <div className="card-premium p-12 md:p-20 text-center flex flex-col items-center justify-center min-h-[600px] font-thai relative overflow-hidden">
            <div className="absolute inset-0 hud-grid opacity-[0.03] pointer-events-none" />
            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none rotate-12">
              <Key size={240} className="text-primary" />
            </div>

            <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
              <div className="w-24 h-24 bg-primary/10 rounded-[2.5rem] flex items-center justify-center text-primary mb-10 status-glow-primary">
                <Lock size={44} />
              </div>
              <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter title-military mb-6">CRYPTOGRAPHIC IDENTITY ROTATION</h2>
              <p className="text-muted-foreground text-sm leading-relaxed mb-12 opacity-80 font-medium tracking-wide">
                คุณกำลังเข้าสู่ส่วนควบคุมการเข้ารหัสระดับรูท ระบบจะทำการทำลายตัวตนเดิมและสร้างอัตลักษณ์ใหม่ให้กับทุกโหนดในระบบเครือข่าย เพื่อความมั่นคงสูงสุดขององค์กร
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-md">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleRotateAllMaster}
                  className="flex items-center justify-center gap-3 bg-destructive hover:bg-destructive/90 py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.1em] text-white transition-all shadow-xl shadow-destructive/20"
                >
                  <RotateCcw size={18} /> หมุนเวียนคลังกุญแจ
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center justify-center gap-3 bg-primary hover:bg-primary/90 py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.1em] text-primary-foreground transition-all shadow-xl shadow-primary/20"
                >
                  <ShieldCheck size={18} /> นโยบายรักษาความลับ
                </motion.button>
              </div>

              <div className="mt-16 flex items-center gap-4 opacity-30">
                <div className="h-px w-12 bg-border" />
                <span className="text-[8px] font-black uppercase tracking-[0.5em]">AES_256_GCM // X25519</span>
                <div className="h-px w-12 bg-border" />
              </div>
            </div>
          </div>
        ) : null;
      case "organizations":
        return isAdmin ? <OrganizationsPage /> : null;
      case "notifications":
        return <NotificationsPage />;
      case "outreach":
        return isRoot ? <StrategicOutreach /> : null;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col lg:flex-row bg-background h-screen text-foreground font-sans overflow-hidden relative">
      <div className="bg-mesh" />
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={logout} user={user} />

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 blur-[120px] rounded-full -mr-64 -mt-64 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-emerald-600/5 blur-[100px] rounded-full -ml-32 -mb-32 pointer-events-none" />

        <DashboardHeader activeTab={activeTab} error={error} />

        <div className="flex-1 overflow-y-auto p-4 md:p-10 z-10 custom-scrollbar scroll-smooth">
          <div className="max-w-7xl mx-auto w-full">
            {isAdmin && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6 mb-10">
                <StatCard icon={<Activity size={20} className="text-blue-500" />} label={t.stats.activeTunnels} value={peers.filter(p => p.status === 'active').length} trend={t.stats.liveConnection} />
                <StatCard icon={<ShieldAlert size={20} className="text-emerald-500" />} label={t.stats.securityEvents} value={auditLogs.length} trend={t.stats.auditLogs} />
                <StatCard icon={<Users size={20} className="text-purple-500" />} label={t.stats.identityMatrix} value={peers.length} trend={t.stats.totalNodes} />
                <StatCard icon={<Cpu size={20} className="text-slate-400" />} label={t.stats.coreEngine} value="v1.2" trend={t.stats.encryption} />
                <StatCard
                  icon={<Activity size={20} className="text-amber-500" />}
                  label="Total Traffic"
                  value={formatBytes(peers.reduce((acc, p) => acc + (p.rx_bytes || 0) + (p.tx_bytes || 0), 0))}
                  trend="NETWORK_LOAD"
                />
              </div>
            )}

            <div className="w-full">
              {renderContent()}
            </div>
          </div>
        </div>
      </main>

      <OnboardingModal
        data={onboardingData}
        onClose={() => setOnboardingData(null)}
      />
    </div>
  );
}
