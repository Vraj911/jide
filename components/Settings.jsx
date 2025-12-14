"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export function Settings({
  open,
  onOpenChange,
  settings,
  onSettingsChange,
  onThemeChange,
}) {
  const [localSettings, setLocalSettings] = useState(settings);

  const handleSave = () => {
    onSettingsChange(localSettings);
    // Update theme if it changed
    if (localSettings.theme !== settings.theme) {
      onThemeChange(localSettings.theme);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Configure your IDE preferences
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Editor Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Editor Settings</h3>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="theme">Theme</Label>
                <select
                  id="theme"
                  value={localSettings.theme}
                  onChange={(e) => {
                    const newTheme = e.target.value;
                    setLocalSettings({ ...localSettings, theme: newTheme });
                  }}
                  className="rounded-md border border-input bg-background px-3 py-1.5 text-sm"
                >
                  <option value="dark">Dark</option>
                  <option value="light">Light</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="fontSize">Font Size</Label>
                <Input
                  id="fontSize"
                  type="number"
                  min="10"
                  max="24"
                  value={localSettings.fontSize}
                  onChange={(e) =>
                    setLocalSettings({
                      ...localSettings,
                      fontSize: parseInt(e.target.value) || 14,
                    })
                  }
                  className="w-20"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="wordWrap">Word Wrap</Label>
                <Switch
                  id="wordWrap"
                  checked={localSettings.wordWrap}
                  onCheckedChange={(checked) =>
                    setLocalSettings({ ...localSettings, wordWrap: checked })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="minimap">Show Minimap</Label>
                <Switch
                  id="minimap"
                  checked={localSettings.minimap}
                  onCheckedChange={(checked) =>
                    setLocalSettings({ ...localSettings, minimap: checked })
                  }
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Execution Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Execution Settings</h3>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="clearOutput">Clear Output Before Run</Label>
                <Switch
                  id="clearOutput"
                  checked={localSettings.clearOutput}
                  onCheckedChange={(checked) =>
                    setLocalSettings({ ...localSettings, clearOutput: checked })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="autoRun">Auto Run on Compile</Label>
                <Switch
                  id="autoRun"
                  checked={localSettings.autoRun}
                  onCheckedChange={(checked) =>
                    setLocalSettings({ ...localSettings, autoRun: checked })
                  }
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Panel Visibility */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Panel Visibility</h3>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="showCompiled">Show Compiled Code Panel</Label>
                <Switch
                  id="showCompiled"
                  checked={localSettings.showCompiled}
                  onCheckedChange={(checked) =>
                    setLocalSettings({ ...localSettings, showCompiled: checked })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="showProblems">Show Problems Panel</Label>
                <Switch
                  id="showProblems"
                  checked={localSettings.showProblems}
                  onCheckedChange={(checked) =>
                    setLocalSettings({ ...localSettings, showProblems: checked })
                  }
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
