import { JudgePassData } from '../types';

export const judges: JudgePassData[] = [
    { id: 'bradford-lee', type: 'MAESTRE_ARCO_JUDGE_PASS', name: 'Bradford Lee', title: 'Product Marketing Manager, Chrome', photo: 'https://i.ibb.co/wJ24s81/Bradford-Lee.webp' },
    { id: 'francois-beaufort', type: 'MAESTRE_ARCO_JUDGE_PASS', name: 'François Beaufort', title: 'Developer Relations Engineer, Chrome', photo: 'https://i.ibb.co/ZJpWkcc/Francois-Beaufort.webp' },
    { id: 'alexandra-klepper', type: 'MAESTRE_ARCO_JUDGE_PASS', name: 'Alexandra Klepper', title: 'Senior Technical Writer, Chrome', photo: 'https://i.ibb.co/qD5BNcH/Alexandra-Klepper.webp' },
    { id: 'thomas-steiner', type: 'MAESTRE_ARCO_JUDGE_PASS', name: 'Thomas Steiner', title: 'Developer Relations Engineer, Chrome', photo: 'https://i.ibb.co/QvjNn8G/Thomas-Steiner.webp' },
    { id: 'andre-bandarra', type: 'MAESTRE_ARCO_JUDGE_PASS', name: 'Andre Bandarra', title: 'Developer Relations Engineer, Chrome', photo: 'https://i.ibb.co/dM302sM/Andre-Bandarra.webp' },
    { id: 'rob-kochman', type: 'MAESTRE_ARCO_JUDGE_PASS', name: 'Rob Kochman', title: 'Group Product Manager, Chrome', photo: 'https://i.ibb.co/s57P3V3/Rob-Kochman.webp' },
    { id: 'kenji-baheux', type: 'MAESTRE_ARCO_JUDGE_PASS', name: 'Kenji Baheux', title: 'Senior Product Manager, Chrome', photo: 'https://i.ibb.co/1q2x0W5/Kenji-Baheux.webp' },
    { id: 'sebastian-benz', type: 'MAESTRE_ARCO_JUDGE_PASS', name: 'Sebastian Benz', title: 'Lead Engineer, Chrome Extensions', photo: 'https://i.ibb.co/7jX4mNf/Sebastian-Benz.webp' }
];

export const getJudgeById = (id: string): JudgePassData | undefined => {
    return judges.find(j => j.id === id);
};
