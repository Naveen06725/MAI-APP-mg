"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trash2, Edit, Database, Play } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface DatabaseData {
  authUsers: any[]
  profiles: any[]
  meetings: any[]
  posts: any[]
  counts: {
    authUsers: number
    profiles: number
    meetings: number
    posts: number
  }
}

export function DatabaseManager() {
  const [data, setData] = useState<DatabaseData | null>(null)
  const [loading, setLoading] = useState(true)
  const [sqlQuery, setSqlQuery] = useState("")
  const [sqlResult, setSqlResult] = useState<any>(null)
  const [editingRecord, setEditingRecord] = useState<any>(null)
  const [editingTable, setEditingTable] = useState<string>("")

  const fetchData = async () => {
    try {
      const response = await fetch("/api/database-manager")
      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error("Failed to fetch database data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const executeSQL = async () => {
    try {
      const response = await fetch("/api/database-manager/sql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: sqlQuery }),
      })
      const result = await response.json()
      setSqlResult(result)
    } catch (error) {
      console.error("SQL execution failed:", error)
      setSqlResult({ error: "Failed to execute query" })
    }
  }

  const deleteRecord = async (table: string, id: string) => {
    if (!confirm(`Are you sure you want to delete this ${table} record?`)) return

    try {
      const response = await fetch("/api/database-manager/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ table, id }),
      })

      if (response.ok) {
        fetchData() // Refresh data
      }
    } catch (error) {
      console.error("Delete failed:", error)
    }
  }

  const updateRecord = async (table: string, id: string, updates: any) => {
    try {
      const response = await fetch("/api/database-manager/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ table, id, updates }),
      })

      if (response.ok) {
        setEditingRecord(null)
        setEditingTable("")
        fetchData() // Refresh data
      }
    } catch (error) {
      console.error("Update failed:", error)
    }
  }

  const clearTestData = async () => {
    if (!confirm("Are you sure you want to clear all test data? This will remove all non-admin users.")) return

    try {
      const response = await fetch("/api/database-manager/clear-test-data", {
        method: "POST",
      })

      if (response.ok) {
        fetchData() // Refresh data
      }
    } catch (error) {
      console.error("Clear test data failed:", error)
    }
  }

  const renderTable = (tableName: string, records: any[]) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {tableName} ({records.length} records)
          <Button variant="outline" size="sm" onClick={() => fetchData()}>
            Refresh
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-50">
                {records.length > 0 &&
                  Object.keys(records[0]).map((key) => (
                    <th key={key} className="border border-gray-300 px-2 py-1 text-left text-sm font-medium">
                      {key}
                    </th>
                  ))}
                <th className="border border-gray-300 px-2 py-1 text-left text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  {Object.entries(record).map(([key, value]) => (
                    <td key={key} className="border border-gray-300 px-2 py-1 text-sm">
                      {typeof value === "object" ? JSON.stringify(value) : String(value)}
                    </td>
                  ))}
                  <td className="border border-gray-300 px-2 py-1">
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingRecord(record)
                          setEditingTable(tableName)
                        }}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => deleteRecord(tableName, record.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading database...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Database Management</h2>
        <div className="flex gap-2">
          <Button onClick={fetchData} variant="outline">
            <Database className="h-4 w-4 mr-2" />
            Refresh All
          </Button>
          <Button onClick={clearTestData} variant="destructive">
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Test Data
          </Button>
        </div>
      </div>

      <Tabs defaultValue="tables" className="w-full">
        <TabsList>
          <TabsTrigger value="tables">Tables</TabsTrigger>
          <TabsTrigger value="sql">SQL Query</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="tables" className="space-y-4">
          {data && (
            <>
              {renderTable("authUsers", data.authUsers)}
              {renderTable("profiles", data.profiles)}
              {renderTable("meetings", data.meetings)}
              {renderTable("posts", data.posts)}
            </>
          )}
        </TabsContent>

        <TabsContent value="sql" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>SQL Query Interface</CardTitle>
              <CardDescription>Execute custom SQL queries on your database</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="sql-query">SQL Query</Label>
                <Textarea
                  id="sql-query"
                  placeholder="SELECT * FROM profiles WHERE..."
                  value={sqlQuery}
                  onChange={(e) => setSqlQuery(e.target.value)}
                  rows={4}
                />
              </div>
              <Button onClick={executeSQL} disabled={!sqlQuery.trim()}>
                <Play className="h-4 w-4 mr-2" />
                Execute Query
              </Button>

              {sqlResult && (
                <div className="mt-4">
                  <Label>Query Result</Label>
                  <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-auto max-h-96">
                    {JSON.stringify(sqlResult, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {data &&
              Object.entries(data.counts).map(([table, count]) => (
                <Card key={table}>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold">{count}</div>
                    <div className="text-sm text-gray-600">{table}</div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Record Dialog */}
      {editingRecord && (
        <Dialog open={!!editingRecord} onOpenChange={() => setEditingRecord(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit {editingTable} Record</DialogTitle>
              <DialogDescription>Modify the record fields below</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {Object.entries(editingRecord).map(([key, value]) => (
                <div key={key}>
                  <Label htmlFor={key}>{key}</Label>
                  <Input
                    id={key}
                    value={String(value)}
                    onChange={(e) =>
                      setEditingRecord({
                        ...editingRecord,
                        [key]: e.target.value,
                      })
                    }
                    disabled={key === "id"}
                  />
                </div>
              ))}
              <div className="flex gap-2">
                <Button onClick={() => updateRecord(editingTable, editingRecord.id, editingRecord)}>
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => setEditingRecord(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
