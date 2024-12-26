import { ElMessage } from 'element-plus'
import type { ApiResponse } from '../views/assets/test/overview/types'

class WebSocketClient {
  private static instance: WebSocketClient
  private ws: WebSocket | null = null
  private messageHandlers: Map<string, (data: any) => void> = new Map()

  private constructor() {}

  public static getInstance(): WebSocketClient {
    if (!WebSocketClient.instance) {
      WebSocketClient.instance = new WebSocketClient()
    }
    return WebSocketClient.instance
  }

  public connect(url: string = 'ws://localhost:3000/ws'): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      return
    }

    this.ws = new WebSocket(url)

    this.ws.onopen = () => {
      console.log('WebSocket 连接已建立')
    }

    this.ws.onmessage = (event) => {
      try {
        const response = JSON.parse(event.data) as ApiResponse<any>
        if (response.code === 200 && response.data) {
          const { type, data } = response.data
          const handler = this.messageHandlers.get(type)
          if (handler) {
            handler(data)
          }
        } else {
          console.error('WebSocket 响应错误:', response.message)
          ElMessage.error(response.message || 'WebSocket 响应错误')
        }
      } catch (error) {
        console.error('WebSocket 消息处理错误:', error)
      }
    }

    this.ws.onerror = (error) => {
      console.error('WebSocket 错误:', error)
      ElMessage.error('WebSocket 连接错误')
    }

    this.ws.onclose = () => {
      console.log('WebSocket 连接已关闭')
      setTimeout(() => this.connect(), 3000)
    }
  }

  public send(type: string, data: any): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      ElMessage.error('WebSocket 未连接')
      return
    }

    this.ws.send(JSON.stringify({
      type,
      data
    }))
  }

  public onMessage(type: string, handler: (data: any) => void): void {
    this.messageHandlers.set(type, handler)
  }

  public removeHandler(type: string): void {
    this.messageHandlers.delete(type)
  }

  public close(): void {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }
}

export default WebSocketClient.getInstance() 