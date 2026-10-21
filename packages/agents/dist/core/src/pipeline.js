import { PIPELINE_STAGES } from '@placegraph/types';
export { PIPELINE_STAGES };
export function stageIndex(status) {
    const map = {
        draft: 0,
        idle: 0,
        analyzing: 1,
        ready: 3,
        strategy_selected: 4,
        designing: 5,
        designed: 6,
        visualized: 7,
        review: 8,
        complete: 8
    };
    return map[status] ?? 0;
}
