import { TRPCError } from "@trpc/server";
import { z } from "../../schema";
import {
  CreateFormInputSchema,
  UpdateFormInputSchema,
  CreateFieldInputSchema,
  UpdateFieldInputSchema,
  FormResponseSchema,
  FieldResponseSchema,
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
    .mutation(async ({ input }) => {
      try {
        return await formService.updateForm(input.formId, input.data);
      } catch (error: any) {
        throw new TRPCError({ code: "BAD_REQUEST", message: error.message });
      }
    }),

  deleteForm: protectedProcedure
    .meta({ openapi: { method: "POST", path: getPath("/delete"), tags: TAGS } })
    .input(z.object({ formId: z.string().uuid() }))
    .output(FormResponseSchema)
    .mutation(async ({ input }) => {
      try {
        return await formService.deleteForm(input.formId);
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
    .mutation(async ({ input }) => {
      try {
        return await formService.publishForm(input.formId);
      } catch (error: any) {
        throw new TRPCError({ code: "BAD_REQUEST", message: error.message });
      }
    }),

  archiveForm: protectedProcedure
    .meta({ openapi: { method: "POST", path: getPath("/archive"), tags: TAGS } })
    .input(z.object({ formId: z.string().uuid() }))
    .output(FormResponseSchema)
    .mutation(async ({ input }) => {
      try {
        return await formService.archiveForm(input.formId);
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
});
