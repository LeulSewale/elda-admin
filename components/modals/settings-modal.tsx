"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useForm } from "@tanstack/react-form"
import { useMutation } from "@tanstack/react-query"
import {
  Settings,
  Palette,
  Globe,
  Shield,
  Database,
  Mail,
  Smartphone,
  Monitor,
  Moon,
  Sun,
  Download,
  Upload,
  Flag,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { useState } from "react"

interface SettingsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const [theme, setTheme] = useState("light")
  const [language, setLanguage] = useState("en")

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: any) => {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      return data
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Settings updated successfully",
      })
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update settings",
        variant: "destructive",
      })
    },
  })

  const generalForm = useForm({
    defaultValues: {
      companyName: "Yene Tender",
      timezone: "Africa/Addis_Ababa",
      dateFormat: "DD/MM/YYYY",
      currency: "ETB",
    },
    onSubmit: async ({ value }) => {
      updateSettingsMutation.mutate({ type: "general", ...value })
    },
  })

  const notificationForm = useForm({
    defaultValues: {
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: false,
      weeklyReports: true,
      systemAlerts: true,
    },
    onSubmit: async ({ value }) => {
      updateSettingsMutation.mutate({ type: "notifications", ...value })
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            System Settings
          </DialogTitle>
          <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg mt-4">
            <Flag className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Coming Soon</span>
            <span className="text-xs text-blue-600">This is a preview of the settings interface. Real functionality will be implemented in future updates.</span>
          </div>
        </DialogHeader>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="data">Data</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  General Settings
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">Preview</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    generalForm.handleSubmit()
                  }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <generalForm.Field name="companyName">
                      {(field) => (
                        <div className="space-y-2">
                          <Label htmlFor="companyName">Company Name</Label>
                          <Input
                            id="companyName"
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                          />
                        </div>
                      )}
                    </generalForm.Field>

                    <generalForm.Field name="timezone">
                      {(field) => (
                        <div className="space-y-2">
                          <Label htmlFor="timezone">Timezone</Label>
                          <Select value={field.state.value} onValueChange={field.handleChange}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Africa/Addis_Ababa">Africa/Addis Ababa</SelectItem>
                              <SelectItem value="UTC">UTC</SelectItem>
                              <SelectItem value="America/New_York">America/New York</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </generalForm.Field>

                    <generalForm.Field name="dateFormat">
                      {(field) => (
                        <div className="space-y-2">
                          <Label htmlFor="dateFormat">Date Format</Label>
                          <Select value={field.state.value} onValueChange={field.handleChange}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                              <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                              <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </generalForm.Field>

                    <generalForm.Field name="currency">
                      {(field) => (
                        <div className="space-y-2">
                          <Label htmlFor="currency">Currency</Label>
                          <Select value={field.state.value} onValueChange={field.handleChange}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ETB">Ethiopian Birr (ETB)</SelectItem>
                              <SelectItem value="USD">US Dollar (USD)</SelectItem>
                              <SelectItem value="EUR">Euro (EUR)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </generalForm.Field>
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" className="bg-[#A4D65E] hover:bg-[#95C653]">
                      Save Changes
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  Appearance Settings
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">Preview</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-base font-medium">Theme</Label>
                    <p className="text-sm text-gray-500 mb-3">Choose your preferred theme</p>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: "light", label: "Light", icon: Sun },
                        { value: "dark", label: "Dark", icon: Moon },
                        { value: "system", label: "System", icon: Monitor },
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setTheme(option.value)}
                          className={`p-4 border rounded-lg flex flex-col items-center gap-2 transition-colors ${
                            theme === option.value
                              ? "border-[#A4D65E] bg-[#A4D65E]/10"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <option.icon className="w-5 h-5" />
                          <span className="text-sm font-medium">{option.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <Label className="text-base font-medium">Language</Label>
                    <p className="text-sm text-gray-500 mb-3">Select your preferred language</p>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="am">አማርኛ (Amharic)</SelectItem>
                        <SelectItem value="or">Afaan Oromoo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <Label className="text-base font-medium">Display Options</Label>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Compact Mode</p>
                          <p className="text-sm text-gray-500">Reduce spacing and padding</p>
                        </div>
                        <Switch />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Show Sidebar Labels</p>
                          <p className="text-sm text-gray-500">Always show labels in sidebar</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Notification Settings
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">Preview</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    notificationForm.handleSubmit()
                  }}
                  className="space-y-6"
                >
                  <div className="space-y-4">
                    <notificationForm.Field name="emailNotifications">
                      {(field) => (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Mail className="w-4 h-4 text-gray-500" />
                            <div>
                              <p className="font-medium">Email Notifications</p>
                              <p className="text-sm text-gray-500">Receive notifications via email</p>
                            </div>
                          </div>
                          <Switch checked={field.state.value} onCheckedChange={field.handleChange} />
                        </div>
                      )}
                    </notificationForm.Field>

                    <notificationForm.Field name="pushNotifications">
                      {(field) => (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Monitor className="w-4 h-4 text-gray-500" />
                            <div>
                              <p className="font-medium">Push Notifications</p>
                              <p className="text-sm text-gray-500">Receive browser notifications</p>
                            </div>
                          </div>
                          <Switch checked={field.state.value} onCheckedChange={field.handleChange} />
                        </div>
                      )}
                    </notificationForm.Field>

                    <notificationForm.Field name="smsNotifications">
                      {(field) => (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Smartphone className="w-4 h-4 text-gray-500" />
                            <div>
                              <p className="font-medium">SMS Notifications</p>
                              <p className="text-sm text-gray-500">Receive notifications via SMS</p>
                            </div>
                          </div>
                          <Switch checked={field.state.value} onCheckedChange={field.handleChange} />
                        </div>
                      )}
                    </notificationForm.Field>

                    <Separator />

                    <notificationForm.Field name="weeklyReports">
                      {(field) => (
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Weekly Reports</p>
                            <p className="text-sm text-gray-500">Receive weekly activity reports</p>
                          </div>
                          <Switch checked={field.state.value} onCheckedChange={field.handleChange} />
                        </div>
                      )}
                    </notificationForm.Field>

                    <notificationForm.Field name="systemAlerts">
                      {(field) => (
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">System Alerts</p>
                            <p className="text-sm text-gray-500">Receive important system notifications</p>
                          </div>
                          <Switch checked={field.state.value} onCheckedChange={field.handleChange} />
                        </div>
                      )}
                    </notificationForm.Field>
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" className="bg-[#A4D65E] hover:bg-[#95C653]">
                      Save Preferences
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Security Settings
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">Preview</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Session Timeout</p>
                      <p className="text-sm text-gray-500">Automatically log out after inactivity</p>
                    </div>
                    <Select defaultValue="30">
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="never">Never</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Login Alerts</p>
                      <p className="text-sm text-gray-500">Get notified of new login attempts</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">IP Restrictions</p>
                      <p className="text-sm text-gray-500">Restrict access to specific IP addresses</p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="data" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  Data Management
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">Preview</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Export Data</h4>
                    <p className="text-sm text-gray-500 mb-4">Download your data in various formats</p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Export as CSV
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Export as JSON
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium mb-2">Import Data</h4>
                    <p className="text-sm text-gray-500 mb-4">Import data from external sources</p>
                    <Button variant="outline" size="sm">
                      <Upload className="w-4 h-4 mr-2" />
                      Import Data
                    </Button>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium mb-2 text-red-600">Danger Zone</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 border border-red-200 rounded-lg">
                        <div>
                          <p className="font-medium text-red-600">Clear All Data</p>
                          <p className="text-sm text-gray-500">Permanently delete all data</p>
                        </div>
                        <Button variant="destructive" size="sm">
                          Clear Data
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
