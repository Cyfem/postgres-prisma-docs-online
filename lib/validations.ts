import { z } from 'zod'

// 注册验证
export const registerSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z
    .string()
    .min(6, '密码至少需要6个字符')
    .max(100, '密码不能超过100个字符'),
  name: z
    .string()
    .max(50, '姓名不能超过50个字符')
    .optional()
    .or(z.literal('')),
})

// 登录验证
export const loginSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(1, '请输入密码'),
})

// 文档验证
export const documentSchema = z.object({
  title: z.string().max(200, '标题不能超过200个字符').optional(),
  content: z.string().optional(),
})

// 标签验证
export const tagSchema = z.object({
  name: z.string().min(1, '标签名不能为空').max(30, '标签名不能超过30个字符'),
  color: z.string().optional(),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type DocumentInput = z.infer<typeof documentSchema>
export type TagInput = z.infer<typeof tagSchema>
