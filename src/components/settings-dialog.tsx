'use client'

import {useEffect, useState} from 'react'
import {Loader2} from 'lucide-react'
import {toast} from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
import {Label} from '@/components/ui/label'
import {configApi} from '@/lib/api/config'
import type {LLMConfig} from '@/lib/api/types'

type SettingsDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const defaultConfig: Required<Pick<LLMConfig, 'base_url' | 'api_key' | 'model_name'>> &
  Pick<LLMConfig, 'temperature' | 'max_tokens'> = {
  base_url: '',
  api_key: '',
  model_name: '',
  temperature: 0.7,
  max_tokens: 8192,
}

export function SettingsDialog({open, onOpenChange}: SettingsDialogProps) {
  const [config, setConfig] = useState<LLMConfig>(defaultConfig)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return

    setLoading(true)
    configApi
      .getLLMConfig()
      .then((data) => {
        setConfig({
          base_url: data.base_url ?? defaultConfig.base_url,
          api_key: data.api_key ?? defaultConfig.api_key,
          model_name: data.model_name ?? defaultConfig.model_name,
          temperature: data.temperature ?? defaultConfig.temperature,
          max_tokens: data.max_tokens ?? defaultConfig.max_tokens,
        })
      })
      .catch((err) => {
        const msg = err instanceof Error ? err.message : '加载配置失败'
        toast.error(msg)
      })
      .finally(() => setLoading(false))
  }, [open])

  const handleChange = (field: keyof LLMConfig, value: string) => {
    if (field === 'temperature' || field === 'max_tokens') {
      const numValue = value === '' ? undefined : Number(value)
      setConfig((prev) => ({...prev, [field]: numValue}))
    } else {
      setConfig((prev) => ({...prev, [field]: value}))
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    try {
      await configApi.updateLLMConfig(config)
      toast.success('LLM 配置保存成功')
      onOpenChange(false)
    } catch (err) {
      const msg = err instanceof Error ? err.message : '保存失败'
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>设置</DialogTitle>
          <DialogDescription>配置 LLM 模型提供商信息</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="size-6 animate-spin text-muted-foreground"/>
          </div>
        ) : (
          <form id="llm-settings-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="base_url">Base URL</Label>
              <Input
                id="base_url"
                type="url"
                placeholder="https://api.example.com/v1"
                value={config.base_url}
                onChange={(e) => handleChange('base_url', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="api_key">API Key</Label>
              <Input
                id="api_key"
                type="password"
                placeholder="sk-..."
                value={config.api_key}
                onChange={(e) => handleChange('api_key', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="model_name">Model Name</Label>
              <Input
                id="model_name"
                type="text"
                placeholder="gpt-4o"
                value={config.model_name}
                onChange={(e) => handleChange('model_name', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="temperature">Temperature</Label>
              <Input
                id="temperature"
                type="number"
                min={0}
                max={2}
                step={0.1}
                value={config.temperature}
                onChange={(e) => handleChange('temperature', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max_tokens">Max Tokens</Label>
              <Input
                id="max_tokens"
                type="number"
                min={1}
                value={config.max_tokens}
                onChange={(e) => handleChange('max_tokens', e.target.value)}
              />
            </div>
          </form>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            className="cursor-pointer"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            取消
          </Button>
          <Button
            type="submit"
            form="llm-settings-form"
            className="cursor-pointer"
            disabled={saving}
          >
            {saving && <Loader2 className="animate-spin"/>}
            保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
