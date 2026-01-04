'use client'
import { useEffect, useState } from "react"
import { getProtocolStats } from "@/services/lendingEngineService"

export default function ProtocolStats() {
  const [stats, setStats] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    getProtocolStats()
      .then(setStats)
      .catch(err => {
        console.error(err)
        setError("Failed to load protocol stats")
      })
  }, [])

  if (error) return <p>{error}</p>
  if (!stats) return <p>Loading stats…</p>

  return (
    <div className="mt-20 text-center">
      <p>Total Supply: {stats.totalSupply}</p>
      <p>Total Borrow: {stats.totalBorrow}</p>
      <p>Total Reserves: {stats.totalReserves}</p>
    </div>
  )
}
