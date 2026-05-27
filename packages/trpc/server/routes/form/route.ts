import { TRPCError } from "@trpc/server";
import { z, zodUndefinedModel } from "../../schema";
import {
  CreateFormInputSchema,
  UpdateFormInputSchema,
  CreateFieldInputSchema,
  UpdateFieldInputSchema,
  FormResponseSchema,
  FieldResponseSchema,
  FormWithStatsResponseSchema,
  CreatePageInputSchema,
  UpdatePageInputSchema,
  PageResponseSchema,
  ReorderInputSchema,
  DefaultThemeResponseSchema,
  CreateDefaultThemeInputSchema,
  PublicTemplateResponseSchema,
  PublicFormResponseSchema,
} from "@repo/services/form/model";
import { publicProcedure, protectedProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import { formService } from "@repo/services";
import redis from "../../utils/redis";

const TAGS = ["Form"];
const getPath = generatePath("/form");

// Cache TTL values (seconds)
const SLUG_CACHE_TTL = 3600;    // 1 hour – public form by slug
const TEMPLATE_CACHE_TTL = 300; // 5 minutes – public/archived templates

export const formRouter = router({
  createForm: protectedProcedure
    .meta({ openapi: { method: "POST", path: getPath("/create"), tags: TAGS } })
    .input(CreateFormInputSchema)
    .output(FormResponseSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        return await formService.createForm(ctx.userId, input);
      } catch (error: any) {
        throw new TRPCError({ code: "BAD_REQUEST", message: error.message });
      }
    }),

  updateForm: protectedProcedure
    .meta({ openapi: { method: "POST", path: getPath("/update"), tags: TAGS } })
    .input(
      z.object({
        formId: z.string().uuid(),
        data: UpdateFormInputSchema,
      })
    )
    .output(FormResponseSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const result = await formService.updateForm(ctx.userId, input.formId, input.data);
        // Invalidate slug cache in case slug changed
        await redis.del(`public:form:slug:${result.slug}`);
        return result;
      } catch (error: any) {
        throw new TRPCError({ code: "BAD_REQUEST", message: error.message });
      }
    }),

  deleteForm: protectedProcedure
    .meta({ openapi: { method: "POST", path: getPath("/delete"), tags: TAGS } })
    .input(z.object({ formId: z.string().uuid() }))
    .output(FormResponseSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const result = await formService.deleteForm(ctx.userId, input.formId);
        await redis.del(`public:form:slug:${result.slug}`);
        return result;
      } catch (error: any) {
        throw new TRPCError({ code: "BAD_REQUEST", message: error.message });
      }
    }),

  getFormById: protectedProcedure
    .meta({ openapi: { method: "GET", path: getPath("/get"), tags: TAGS } })
    .input(z.object({ formId: z.string().uuid() }))
    .output(FormResponseSchema)
    .query(async ({ input }) => {
      try {
        return await formService.getFormById(input.formId);
      } catch (error: any) {
        throw new TRPCError({ code: "NOT_FOUND", message: error.message });
      }
    }),

  // Redis cached: public form fetch by slug (used on live form page)
  getFormBySlug: publicProcedure
    .meta({ openapi: { method: "GET", path: getPath("/get-by-slug"), tags: TAGS } })
    .input(z.object({ workspaceId: z.string().uuid().optional(), slug: z.string() }))
    .output(FormResponseSchema)
    .query(async ({ input }) => {
      try {
        const cacheKey = `public:form:slug:${input.slug}`;
        const cached = await redis.get(cacheKey);
        if (cached) {
          return JSON.parse(cached);
        }
        const data = await formService.getFormBySlug(input.workspaceId, input.slug);
        await redis.setex(cacheKey, SLUG_CACHE_TTL, JSON.stringify(data));
        return data;
      } catch (error: any) {
        throw new TRPCError({ code: "NOT_FOUND", message: error.message });
      }
    }),

  getFormsByWorkspace: protectedProcedure
    .meta({ openapi: { method: "GET", path: getPath("/list"), tags: TAGS } })
    .input(z.object({ workspaceId: z.string().uuid() }))
    .output(z.readonly(z.array(FormResponseSchema)))
    .query(async ({ input }) => {
      try {
        return await formService.getFormsByWorkspace(input.workspaceId);
      } catch (error: any) {
        throw new TRPCError({ code: "BAD_REQUEST", message: error.message });
      }
    }),

  publishForm: protectedProcedure
    .meta({ openapi: { method: "POST", path: getPath("/publish"), tags: TAGS } })
    .input(z.object({ formId: z.string().uuid() }))
    .output(FormResponseSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const result = await formService.publishForm(ctx.userId, input.formId);
        // Slug cache may now serve stale draft data — clear it
        await redis.del(`public:form:slug:${result.slug}`);
        return result;
      } catch (error: any) {
        throw new TRPCError({ code: "BAD_REQUEST", message: error.message });
      }
    }),

  archiveForm: protectedProcedure
    .meta({ openapi: { method: "POST", path: getPath("/archive"), tags: TAGS } })
    .input(z.object({ formId: z.string().uuid() }))
    .output(FormResponseSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const result = await formService.archiveForm(ctx.userId, input.formId);
        await redis.del(`public:form:slug:${result.slug}`);
        return result;
      } catch (error: any) {
        throw new TRPCError({ code: "BAD_REQUEST", message: error.message });
      }
    }),

  createField: protectedProcedure
    .meta({ openapi: { method: "POST", path: getPath("/field/create"), tags: TAGS } })
    .input(CreateFieldInputSchema)
    .output(FieldResponseSchema)
    .mutation(async ({ input }) => {
      try {
        return await formService.createField(input);
      } catch (error: any) {
        throw new TRPCError({ code: "BAD_REQUEST", message: error.message });
      }
    }),

  updateField: protectedProcedure
    .meta({ openapi: { method: "POST", path: getPath("/field/update"), tags: TAGS } })
    .input(
      z.object({
        fieldId: z.string().uuid(),
        data: UpdateFieldInputSchema,
      })
    )
    .output(FieldResponseSchema)
    .mutation(async ({ input }) => {
      try {
        return await formService.updateField(input.fieldId, input.data);
      } catch (error: any) {
        throw new TRPCError({ code: "BAD_REQUEST", message: error.message });
      }
    }),

  deleteField: protectedProcedure
    .meta({ openapi: { method: "POST", path: getPath("/field/delete"), tags: TAGS } })
    .input(z.object({ fieldId: z.string().uuid() }))
    .output(FieldResponseSchema)
    .mutation(async ({ input }) => {
      try {
        return await formService.deleteField(input.fieldId);
      } catch (error: any) {
        throw new TRPCError({ code: "BAD_REQUEST", message: error.message });
      }
    }),

  getFieldsByForm: publicProcedure
    .meta({ openapi: { method: "GET", path: getPath("/fields"), tags: TAGS } })
    .input(z.object({ formId: z.string().uuid() }))
    .output(z.readonly(z.array(FieldResponseSchema)))
    .query(async ({ input }) => {
      try {
        return await formService.getFieldsByForm(input.formId);
      } catch (error: any) {
        throw new TRPCError({ code: "BAD_REQUEST", message: error.message });
      }
    }),

  getPagesByForm: publicProcedure
    .meta({ openapi: { method: "GET", path: getPath("/pages"), tags: TAGS } })
    .input(z.object({ formId: z.string().uuid() }))
    .output(z.readonly(z.array(PageResponseSchema)))
    .query(async ({ input }) => {
      try {
        return await formService.getPagesByForm(input.formId);
      } catch (error: any) {
        throw new TRPCError({ code: "BAD_REQUEST", message: error.message });
      }
    }),

  createPage: protectedProcedure
    .meta({ openapi: { method: "POST", path: getPath("/page/create"), tags: TAGS } })
    .input(CreatePageInputSchema)
    .output(PageResponseSchema)
    .mutation(async ({ input }) => {
      try {
        return await formService.createPage(input);
      } catch (error: any) {
        throw new TRPCError({ code: "BAD_REQUEST", message: error.message });
      }
    }),

  updatePage: protectedProcedure
    .meta({ openapi: { method: "POST", path: getPath("/page/update"), tags: TAGS } })
    .input(z.object({ pageId: z.string().uuid(), data: UpdatePageInputSchema }))
    .output(PageResponseSchema)
    .mutation(async ({ input }) => {
      try {
        return await formService.updatePage(input.pageId, input.data);
      } catch (error: any) {
        throw new TRPCError({ code: "BAD_REQUEST", message: error.message });
      }
    }),

  deletePage: protectedProcedure
    .meta({ openapi: { method: "POST", path: getPath("/page/delete"), tags: TAGS } })
    .input(z.object({ pageId: z.string().uuid() }))
    .output(PageResponseSchema)
    .mutation(async ({ input }) => {
      try {
        return await formService.deletePage(input.pageId);
      } catch (error: any) {
        throw new TRPCError({ code: "BAD_REQUEST", message: error.message });
      }
    }),

  reorderPages: protectedProcedure
    .meta({ openapi: { method: "POST", path: getPath("/pages/reorder"), tags: TAGS } })
    .input(ReorderInputSchema)
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ input }) => {
      try {
        await formService.reorderPages(input);
        return { success: true };
      } catch (error: any) {
        throw new TRPCError({ code: "BAD_REQUEST", message: error.message });
      }
    }),

  reorderFields: protectedProcedure
    .meta({ openapi: { method: "POST", path: getPath("/fields/reorder"), tags: TAGS } })
    .input(ReorderInputSchema)
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ input }) => {
      try {
        await formService.reorderFields(input);
        return { success: true };
      } catch (error: any) {
        throw new TRPCError({ code: "BAD_REQUEST", message: error.message });
      }
    }),

  getFormsWithStats: protectedProcedure
    .meta({ openapi: { method: "GET", path: getPath("/list-with-stats"), tags: TAGS } })
    .input(z.object({ workspaceId: z.string().uuid() }))
    .output(z.readonly(z.array(FormWithStatsResponseSchema)))
    .query(async ({ input }) => {
      try {
        return await formService.getFormsWithStats(input.workspaceId);
      } catch (error: any) {
        throw new TRPCError({ code: "BAD_REQUEST", message: error.message });
      }
    }),

  uploadFile: publicProcedure
    .meta({ openapi: { method: "POST", path: getPath("/upload"), tags: TAGS } })
    .input(z.object({ fileData: z.string(), folder: z.string() }))
    .output(z.object({ url: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const url = await formService.uploadFile(input.fileData, input.folder);
        return { url };
      } catch (error: any) {
        throw new TRPCError({ code: "BAD_REQUEST", message: error.message });
      }
    }),

  // Redis cached: public templates list
  getPublicTemplates: publicProcedure
    .meta({ openapi: { method: "GET", path: getPath("/templates/public"), tags: TAGS } })
    .input(zodUndefinedModel)
    .output(z.readonly(z.array(PublicTemplateResponseSchema)))
    .query(async () => {
      try {
        const cacheKey = "public:templates";
        const cached = await redis.get(cacheKey);
        if (cached) {
          return JSON.parse(cached) as Array<{ form: any; workspace: { name: string; logoUrl: string | null } }>;
        }
        const data = await formService.getPublicTemplates();
        await redis.setex(cacheKey, TEMPLATE_CACHE_TTL, JSON.stringify(data));
        return data as Array<{ form: any; workspace: { name: string; logoUrl: string | null } }>;
      } catch (error: any) {
        throw new TRPCError({ code: "BAD_REQUEST", message: error.message });
      }
    }),

  // Redis cached: public forms list
  getPublicForms: publicProcedure
    .meta({ openapi: { method: "GET", path: getPath("/public"), tags: TAGS } })
    .input(zodUndefinedModel)
    .output(z.readonly(z.array(PublicFormResponseSchema)))
    .query(async () => {
      try {
        const cacheKey = "public:forms";
        const cached = await redis.get(cacheKey);
        if (cached) {
          return JSON.parse(cached) as Array<{ form: any; workspace: { name: string; logoUrl: string | null } }>;
        }
        const data = await formService.getPublicForms();
        await redis.setex(cacheKey, TEMPLATE_CACHE_TTL, JSON.stringify(data));
        return data as Array<{ form: any; workspace: { name: string; logoUrl: string | null } }>;
      } catch (error: any) {
        throw new TRPCError({ code: "BAD_REQUEST", message: error.message });
      }
    }),

  cloneFormTemplate: protectedProcedure
    .meta({ openapi: { method: "POST", path: getPath("/template/clone"), tags: TAGS } })
    .input(z.object({ formId: z.string().uuid(), workspaceId: z.string().uuid() }))
    .output(FormResponseSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        return await formService.cloneFormTemplate(ctx.userId, input.formId, input.workspaceId);
      } catch (error: any) {
        throw new TRPCError({ code: "BAD_REQUEST", message: error.message });
      }
    }),

  archiveTemplate: protectedProcedure
    .meta({ openapi: { method: "POST", path: getPath("/template/archive"), tags: TAGS } })
    .input(z.object({ formId: z.string().uuid() }))
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      try {
        await formService.archiveTemplate(ctx.userId, input.formId);
        // Invalidate archived templates cache for this user
        await redis.del(`archived:templates:${ctx.userId}`);
        // Also invalidate public templates since visibility may change
        await redis.del("public:templates");
        return { success: true };
      } catch (error: any) {
        throw new TRPCError({ code: "BAD_REQUEST", message: error.message });
      }
    }),

  unarchiveTemplate: protectedProcedure
    .meta({ openapi: { method: "POST", path: getPath("/template/unarchive"), tags: TAGS } })
    .input(z.object({ formId: z.string().uuid() }))
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      try {
        await formService.unarchiveTemplate(ctx.userId, input.formId);
        await redis.del(`archived:templates:${ctx.userId}`);
        await redis.del("public:templates");
        return { success: true };
      } catch (error: any) {
        throw new TRPCError({ code: "BAD_REQUEST", message: error.message });
      }
    }),

  // Redis cached: archived templates (per user)
  getArchivedTemplates: protectedProcedure
    .meta({ openapi: { method: "GET", path: getPath("/templates/archived"), tags: TAGS } })
    .input(zodUndefinedModel)
    .output(z.readonly(z.array(PublicTemplateResponseSchema)))
    .query(async ({ ctx }) => {
      try {
        const cacheKey = `archived:templates:${ctx.userId}`;
        const cached = await redis.get(cacheKey);
        if (cached) {
          return JSON.parse(cached) as Array<{ form: any; workspace: { name: string; logoUrl: string | null } }>;
        }
        const data = await formService.getArchivedTemplates(ctx.userId);
        await redis.setex(cacheKey, TEMPLATE_CACHE_TTL, JSON.stringify(data));
        return data as Array<{ form: any; workspace: { name: string; logoUrl: string | null } }>;
      } catch (error: any) {
        throw new TRPCError({ code: "BAD_REQUEST", message: error.message });
      }
    }),

  isTemplateArchived: protectedProcedure
    .meta({ openapi: { method: "GET", path: getPath("/template/is-archived"), tags: TAGS } })
    .input(z.object({ formId: z.string().uuid() }))
    .output(z.boolean())
    .query(async ({ ctx, input }) => {
      try {
        return await formService.isTemplateArchived(ctx.userId, input.formId);
      } catch (error: any) {
        throw new TRPCError({ code: "BAD_REQUEST", message: error.message });
      }
    }),

  getDefaultThemes: publicProcedure
    .meta({ openapi: { method: "GET", path: getPath("/themes/default"), tags: TAGS } })
    .input(zodUndefinedModel)
    .output(z.array(DefaultThemeResponseSchema))
    .query(async () => {
      try {
        return await formService.getDefaultThemes();
      } catch (error: any) {
        throw new TRPCError({ code: "BAD_REQUEST", message: error.message });
      }
    }),

  createDefaultTheme: protectedProcedure
    .meta({ openapi: { method: "POST", path: getPath("/theme/default/create"), tags: TAGS } })
    .input(CreateDefaultThemeInputSchema)
    .output(DefaultThemeResponseSchema)
    .mutation(async ({ input }) => {
      try {
        return await formService.createDefaultTheme(input);
      } catch (error: any) {
        throw new TRPCError({ code: "BAD_REQUEST", message: error.message });
      }
    }),

  deleteDefaultTheme: protectedProcedure
    .meta({ openapi: { method: "POST", path: getPath("/theme/default/delete"), tags: TAGS } })
    .input(z.object({ id: z.string().uuid() }))
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ input }) => {
      try {
        await formService.deleteDefaultTheme(input.id);
        return { success: true };
      } catch (error: any) {
        throw new TRPCError({ code: "BAD_REQUEST", message: error.message });
      }
    }),
});
