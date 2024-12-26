import * as k8s from '@kubernetes/client-node'
import { readFileSync } from 'fs'

export class K8sClient {
  private static instance: K8sClient
  private kc: k8s.KubeConfig
  private k8sApi: k8s.CoreV1Api

  private constructor() {
    this.kc = new k8s.KubeConfig()
    // 从配置文件加载
    this.kc.loadFromFile('admin.conf')
    this.k8sApi = this.kc.makeApiClient(k8s.CoreV1Api)
  }

  public static getInstance(): K8sClient {
    if (!K8sClient.instance) {
      K8sClient.instance = new K8sClient()
    }
    return K8sClient.instance
  }

  // 获取所有包含 "service" 的命名空间
  public async getServiceNamespaces(): Promise<string[]> {
    try {
      const response = await this.k8sApi.listNamespace()
      return response.body.items
        .map(ns => ns.metadata?.name || '')
        .filter(name => name.includes('service'))
    } catch (error) {
      console.error('获取命名空间失败:', error)
      throw error
    }
  }

  // 获取指定命名空间的所有 Pod
  public async getNamespacePods(namespace: string): Promise<k8s.V1Pod[]> {
    try {
      const response = await this.k8sApi.listNamespacedPod(namespace)
      return response.body.items
    } catch (error) {
      console.error(`获取命名空间 ${namespace} 的 Pod 失败:`, error)
      throw error
    }
  }

  // 获取所有命名空间的 Pod
  public async getAllPods(): Promise<Map<string, k8s.V1Pod[]>> {
    const namespaces = await this.getServiceNamespaces()
    const podsMap = new Map<string, k8s.V1Pod[]>()

    for (const namespace of namespaces) {
      const pods = await this.getNamespacePods(namespace)
      podsMap.set(namespace, pods)
    }

    return podsMap
  }

  // 检查命名空间是否存在 Pod
  public async checkNamespaceHasPods(namespace: string): Promise<boolean> {
    try {
      const pods = await this.getNamespacePods(namespace)
      return pods.length > 0
    } catch (error) {
      console.error(`检查命名空间 ${namespace} 是否存在 Pod 失败:`, error)
      throw error
    }
  }
}