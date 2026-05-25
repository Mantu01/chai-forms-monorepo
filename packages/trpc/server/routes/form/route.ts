import { TRPCError } from "@trpc/server";
import { z } from "../../schema";
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
} from "@repo/services/form/model";
import { publicProcedure, protectedProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import { formService } from "@repo/services";

const TAGS = ["Form"];
const getPath = generatePath("/form");

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
        return await formService.updateForm(ctx.userId, input.formId, input.data);
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
        return await formService.deleteForm(ctx.userId, input.formId);
      } catch (error: any) {
        throw new TRPCError({ code: "BAD_REQUEST", message: error.message });
      }
    }),

  getFormById: publicProcedure
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

  getFormBySlug: publicProcedure
    .meta({ openapi: { method: "GET", path: getPath("/get-by-slug"), tags: TAGS } })
    .input(z.object({ workspaceId: z.string().uuid().optional(), slug: z.string() }))
    .output(FormResponseSchema)
    .query(async ({ input }) => {
      try {
        return await formService.getFormBySlug(input.workspaceId, input.slug);
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
        return await formService.publishForm(ctx.userId, input.formId);
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
        return await formService.archiveForm(ctx.userId, input.formId);
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

  getPublicTemplates: publicProcedure
    .query(async () => {
      try {
        return await formService.getPublicTemplates();
      } catch (error: any) {
        throw new TRPCError({ code: "BAD_REQUEST", message: error.message });
      }
    }),

  cloneFormTemplate: protectedProcedure
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
    .input(z.object({ formId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      try {
        await formService.archiveTemplate(ctx.userId, input.formId);
        return { success: true };
      } catch (error: any) {
        throw new TRPCError({ code: "BAD_REQUEST", message: error.message });
      }
    }),

  unarchiveTemplate: protectedProcedure
    .input(z.object({ formId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      try {
        await formService.unarchiveTemplate(ctx.userId, input.formId);
        return { success: true };
      } catch (error: any) {
        throw new TRPCError({ code: "BAD_REQUEST", message: error.message });
      }
    }),

  getArchivedTemplates: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        return await formService.getArchivedTemplates(ctx.userId);
      } catch (error: any) {
        throw new TRPCError({ code: "BAD_REQUEST", message: error.message });
      }
    }),

  isTemplateArchived: protectedProcedure
    .input(z.object({ formId: z.string().uuid() }))
    .output(z.boolean())
    .query(async ({ ctx, input }) => {
      try {
        return await formService.isTemplateArchived(ctx.userId, input.formId);
      } catch (error: any) {
        throw new TRPCError({ code: "BAD_REQUEST", message: error.message });
      }
    }),
});
