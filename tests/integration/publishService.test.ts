import { describe, it, expect, vi } from 'vitest';
import { publishService } from '../../lib/services/publishService';
import { courseRepository } from '../../lib/repositories/courseRepository';
import { runtimeRepository } from '../../lib/repositories/runtimeRepository';

describe('publishService', () => {
  it('publishes approved version into runtime package', async () => {
    const client = {} as never;
    vi.spyOn(courseRepository, 'getVersion').mockResolvedValue({ id: 'v1', courseId: 'c1', versionNo: 1, status: 'approved' });
    vi.spyOn(courseRepository, 'getDraftTree').mockResolvedValue({
      modules: [{ id: 'm1', courseVersionId: 'v1', title: 'M1', orderIndex: 1 }],
      lessons: [{ id: 'l1', moduleId: 'm1', title: 'L1', slug: 'l1', orderIndex: 1, completionRule: { minRequiredNodes: 1 } }],
      nodes: [{ id: 'n1', lessonId: 'l1', nodeType: 'reading', orderIndex: 1, config: { markdown: 'x' }, required: true }],
    });
    vi.spyOn(courseRepository, 'getCourse').mockResolvedValue({ id: 'c1', slug: 'c', title: 'Course', summary: null });
    vi.spyOn(courseRepository, 'updateVersionStatus').mockResolvedValue();
    vi.spyOn(runtimeRepository, 'createRuntimePackage').mockResolvedValue({} as never);
    vi.spyOn(runtimeRepository, 'createRuntimeLesson').mockImplementation(async (_c, l) => l);
    vi.spyOn(runtimeRepository, 'createRuntimeNode').mockResolvedValue({} as never);

    const from = vi.fn(() => ({
      insert: vi.fn(() => ({ select: vi.fn(() => ({ single: vi.fn(async () => ({ data: { id: 'pj1', course_version_id: 'v1', status: 'building' }, error: null })) })) })),
      select: vi.fn(() => ({ eq: vi.fn(() => ({ order: vi.fn(() => ({ limit: vi.fn(async () => ({ data: [], error: null })) })) })) })),
      update: vi.fn(() => ({ eq: vi.fn(async () => ({ error: null })) })),
    }));
    (client as any).from = from;

    const out = await publishService.publishCourseVersion(client as never, 'v1');
    expect(out.runtimePackage.courseVersionId).toBe('v1');
    expect(courseRepository.updateVersionStatus).toHaveBeenCalledWith(client, 'v1', 'published');
  });
});
