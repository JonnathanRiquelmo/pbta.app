import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { useAppStore } from '@shared/store/appStore'
import { Role } from '@auth/types'
import { getDb, hasFirebaseConfig } from '@fb/client'
import { addDoc, collection } from 'firebase/firestore'

type Props = {
    allowedRoles?: Role[]
}

function AuditRedirect({ reason, attemptedPath, userId, role }: { reason: string; attemptedPath: string; userId?: string; role?: Role }) {
    useEffect(() => {
        try {
            if (!hasFirebaseConfig()) return
            const db = getDb()
            if (!db) return
            void addDoc(collection(db, 'audit_logs'), {
                type: 'unauthorized_access',
                reason,
                path: attemptedPath,
                userId: userId || 'anonymous',
                role: role || null,
                userAgent: navigator.userAgent,
                timestamp: Date.now()
            })
        } catch (_) { void 0 }
    }, [reason, attemptedPath, userId, role])
    return <Navigate to="/home" replace />
}

export default function ProtectedRoute({ allowedRoles }: Props) {
    const user = useAppStore(s => s.user)
    const location = useLocation()

    if (!user) {
        return <AuditRedirect reason="not_authenticated" attemptedPath={location.pathname} />
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <AuditRedirect reason="role_forbidden" attemptedPath={location.pathname} userId={user.uid} role={user.role} />
    }

    return <Outlet />
}
