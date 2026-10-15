export interface DbProject {
  id: string;
  name: string;
  data: any;
  created_at: string;
  updated_at: string;
}

export interface DbAnalysisRun {
  id: string;
  project_id: string;
  status: string;
  inputs_hash: string;
  data: any;
  created_at: string;
  completed_at?: string;
}

export interface DbOpportunity {
  id: string;
  analysis_run_id: string;
  type: string;
  data: any;
  provenance: any;
  created_at: string;
}

export interface DbStrategy {
  id: string;
  analysis_run_id: string;
  selected: boolean;
  data: any;
  provenance: any;
  created_at: string;
}

export interface DbExperienceRequirement {
  id: string;
  strategy_id: string;
  data: any;
  created_at: string;
}

export interface DbArchitecturalDecision {
  id: string;
  strategy_id: string;
  data: any;
  provenance: any;
  created_at: string;
}

export interface DbSpatialConcept {
  id: string;
  strategy_id: string;
  data: any;
  created_at: string;
}

export interface DbVisualization {
  id: string;
  spatial_concept_id?: string;
  strategy_id?: string;
  prompt: string;
  images: string[];
  model: string;
  provenance: any;
  created_at: string;
}

export interface DbReview {
  id: string;
  project_id: string;
  feedback: string;
  chain_level: string;
  resolved: boolean;
  data: any;
  created_at: string;
}
