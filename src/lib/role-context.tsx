"use client"

import { createContext, useContext, useEffect, useState } from "react"

export const ROLES = {
  admin_lit: "Admin Litigasi",
  approver: "Approver",
  requester: "Requester",
  viewer: "Viewer",
} as const

export type BossRole = keyof typeof ROLES

interface RoleContextValue {
  role: BossRole
  roleName: string
  setRole: (role: BossRole) => void
}

const RoleContext = createContext<RoleContextValue>({
  role: "admin_lit",
  roleName: "Admin Litigasi",
  setRole: () => {},
})

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<BossRole>("admin_lit")

  useEffect(() => {
    const saved = localStorage.getItem("boss_proto_role") as BossRole | null
    if (saved && saved in ROLES) setRoleState(saved)
  }, [])

  function setRole(r: BossRole) {
    setRoleState(r)
    localStorage.setItem("boss_proto_role", r)
  }

  return (
    <RoleContext.Provider value={{ role, roleName: ROLES[role], setRole }}>
      {children}
    </RoleContext.Provider>
  )
}

export function useRole() {
  return useContext(RoleContext)
}
