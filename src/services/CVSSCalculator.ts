/**
 * CVSS Score Calculator and Risk Assessment Engine
 * Enterprise-grade CVSS v3.1 implementation with automated risk scoring
 */

export interface ICVSSv3Vector {
  // Base Score Metrics
  attackVector: 'N' | 'A' | 'L' | 'P'; // Network, Adjacent, Local, Physical
  attackComplexity: 'L' | 'H'; // Low, High
  privilegesRequired: 'N' | 'L' | 'H'; // None, Low, High
  userInteraction: 'N' | 'R'; // None, Required
  scope: 'U' | 'C'; // Unchanged, Changed
  confidentialityImpact: 'H' | 'L' | 'N'; // High, Low, None
  integrityImpact: 'H' | 'L' | 'N'; // High, Low, None
  availabilityImpact: 'H' | 'L' | 'N'; // High, Low, None
  
  // Temporal Score Metrics (Optional)
  exploitCodeMaturity?: 'X' | 'H' | 'F' | 'P' | 'U'; // Not Defined, High, Functional, Proof-of-Concept, Unproven
  remediationLevel?: 'X' | 'U' | 'W' | 'T' | 'O'; // Not Defined, Unavailable, Workaround, Temporary Fix, Official Fix
  reportConfidence?: 'X' | 'C' | 'R' | 'U'; // Not Defined, Confirmed, Reasonable, Unknown
  
  // Environmental Score Metrics (Optional)
  confidentialityRequirement?: 'X' | 'H' | 'M' | 'L'; // Not Defined, High, Medium, Low
  integrityRequirement?: 'X' | 'H' | 'M' | 'L'; // Not Defined, High, Medium, Low
  availabilityRequirement?: 'X' | 'H' | 'M' | 'L'; // Not Defined, High, Medium, Low
  modifiedAttackVector?: 'X' | 'N' | 'A' | 'L' | 'P';
  modifiedAttackComplexity?: 'X' | 'L' | 'H';
  modifiedPrivilegesRequired?: 'X' | 'N' | 'L' | 'H';
  modifiedUserInteraction?: 'X' | 'N' | 'R';
  modifiedScope?: 'X' | 'U' | 'C';
  modifiedConfidentialityImpact?: 'X' | 'H' | 'L' | 'N';
  modifiedIntegrityImpact?: 'X' | 'H' | 'L' | 'N';
  modifiedAvailabilityImpact?: 'X' | 'H' | 'L' | 'N';
}

export interface ICVSSScore {
  baseScore: number;
  baseSeverity: 'None' | 'Low' | 'Medium' | 'High' | 'Critical';
  temporalScore?: number;
  environmentalScore?: number;
  overallScore: number;
  overallSeverity: 'None' | 'Low' | 'Medium' | 'High' | 'Critical';
  vectorString: string;
  subscores: {
    impactScore: number;
    exploitabilityScore: number;
    modifiedImpactScore?: number;
  };
}

export interface IRiskAssessment {
  riskScore: number; // 0-100 composite risk score
  riskLevel: 'Critical' | 'High' | 'Medium' | 'Low' | 'Minimal';
  businessImpact: {
    financial: number;
    operational: number;
    reputational: number;
    compliance: number;
  };
  threatContext: {
    exploitAvailability: boolean;
    exploitComplexity: 'Low' | 'Medium' | 'High';
    threatActorInterest: number; // 0-100
    inWildExploitation: boolean;
  };
  assetContext: {
    criticality: 'Critical' | 'High' | 'Medium' | 'Low';
    exposure: 'Internet' | 'Internal' | 'Isolated';
    dataClassification: 'Public' | 'Internal' | 'Confidential' | 'Restricted';
  };
  remediationGuidance: {
    priority: 'P0' | 'P1' | 'P2' | 'P3' | 'P4';
    timeframe: string;
    complexity: 'Low' | 'Medium' | 'High';
    recommendations: string[];
  };
}

export class CVSSCalculator {
  private static readonly BASE_METRIC_VALUES = {
    attackVector: { N: 0.85, A: 0.62, L: 0.55, P: 0.2 },
    attackComplexity: { L: 0.77, H: 0.44 },
    privilegesRequired: {
      unchanged: { N: 0.85, L: 0.62, H: 0.27 },
      changed: { N: 0.85, L: 0.68, H: 0.5 }
    },
    userInteraction: { N: 0.85, R: 0.62 },
    confidentialityImpact: { H: 0.56, L: 0.22, N: 0 },
    integrityImpact: { H: 0.56, L: 0.22, N: 0 },
    availabilityImpact: { H: 0.56, L: 0.22, N: 0 }
  };

  private static readonly TEMPORAL_METRIC_VALUES = {
    exploitCodeMaturity: { X: 1.0, H: 1.0, F: 0.97, P: 0.94, U: 0.91 },
    remediationLevel: { X: 1.0, U: 1.0, W: 0.97, T: 0.96, O: 0.95 },
    reportConfidence: { X: 1.0, C: 1.0, R: 0.96, U: 0.92 }
  };

  private static readonly ENVIRONMENTAL_METRIC_VALUES = {
    confidentialityRequirement: { X: 1.0, H: 1.5, M: 1.0, L: 0.5 },
    integrityRequirement: { X: 1.0, H: 1.5, M: 1.0, L: 0.5 },
    availabilityRequirement: { X: 1.0, H: 1.5, M: 1.0, L: 0.5 }
  };

  /**
   * Calculate CVSS v3.1 scores from vector components
   */
  public static calculateCVSSScore(vector: ICVSSv3Vector): ICVSSScore {
    // Calculate base score
    const baseScore = this.calculateBaseScore(vector);
    const baseSeverity = this.getSeverityRating(baseScore);

    // Calculate temporal score if metrics provided
    let temporalScore: number | undefined;
    if (vector.exploitCodeMaturity || vector.remediationLevel || vector.reportConfidence) {
      temporalScore = this.calculateTemporalScore(baseScore, vector);
    }

    // Calculate environmental score if metrics provided
    let environmentalScore: number | undefined;
    if (this.hasEnvironmentalMetrics(vector)) {
      environmentalScore = this.calculateEnvironmentalScore(vector);
    }

    // Determine overall score (environmental > temporal > base)
    const overallScore = environmentalScore || temporalScore || baseScore;
    const overallSeverity = this.getSeverityRating(overallScore);

    // Generate vector string
    const vectorString = this.generateVectorString(vector);

    // Calculate subscores
    const subscores = this.calculateSubscores(vector);

    return {
      baseScore,
      baseSeverity,
      temporalScore,
      environmentalScore,
      overallScore,
      overallSeverity,
      vectorString,
      subscores
    };
  }

  /**
   * Parse CVSS vector string into components
   */
  public static parseVectorString(vectorString: string): ICVSSv3Vector {
    const parts = vectorString.replace('CVSS:3.1/', '').split('/');
    const vector: Partial<ICVSSv3Vector> = {};

    parts.forEach(part => {
      const [metric, value] = part.split(':');
      switch (metric) {
        case 'AV': vector.attackVector = value as any; break;
        case 'AC': vector.attackComplexity = value as any; break;
        case 'PR': vector.privilegesRequired = value as any; break;
        case 'UI': vector.userInteraction = value as any; break;
        case 'S': vector.scope = value as any; break;
        case 'C': vector.confidentialityImpact = value as any; break;
        case 'I': vector.integrityImpact = value as any; break;
        case 'A': vector.availabilityImpact = value as any; break;
        case 'E': vector.exploitCodeMaturity = value as any; break;
        case 'RL': vector.remediationLevel = value as any; break;
        case 'RC': vector.reportConfidence = value as any; break;
        case 'CR': vector.confidentialityRequirement = value as any; break;
        case 'IR': vector.integrityRequirement = value as any; break;
        case 'AR': vector.availabilityRequirement = value as any; break;
        case 'MAV': vector.modifiedAttackVector = value as any; break;
        case 'MAC': vector.modifiedAttackComplexity = value as any; break;
        case 'MPR': vector.modifiedPrivilegesRequired = value as any; break;
        case 'MUI': vector.modifiedUserInteraction = value as any; break;
        case 'MS': vector.modifiedScope = value as any; break;
        case 'MC': vector.modifiedConfidentialityImpact = value as any; break;
        case 'MI': vector.modifiedIntegrityImpact = value as any; break;
        case 'MA': vector.modifiedAvailabilityImpact = value as any; break;
      }
    });

    return vector as ICVSSv3Vector;
  }

  private static calculateBaseScore(vector: ICVSSv3Vector): number {
    const subscores = this.calculateSubscores(vector);
    const { impactScore, exploitabilityScore } = subscores;

    let baseScore: number;
    if (impactScore <= 0) {
      baseScore = 0;
    } else {
      if (vector.scope === 'U') {
        baseScore = Math.min(impactScore + exploitabilityScore, 10);
      } else {
        baseScore = Math.min(1.08 * (impactScore + exploitabilityScore), 10);
      }
    }

    return Math.ceil(baseScore * 10) / 10;
  }

  private static calculateSubscores(vector: ICVSSv3Vector) {
    // Impact subscore
    const impactConfidentiality = this.BASE_METRIC_VALUES.confidentialityImpact[vector.confidentialityImpact];
    const impactIntegrity = this.BASE_METRIC_VALUES.integrityImpact[vector.integrityImpact];
    const impactAvailability = this.BASE_METRIC_VALUES.availabilityImpact[vector.availabilityImpact];

    const impactBase = 1 - ((1 - impactConfidentiality) * (1 - impactIntegrity) * (1 - impactAvailability));
    
    let impactScore: number;
    if (vector.scope === 'U') {
      impactScore = 6.42 * impactBase;
    } else {
      impactScore = 7.52 * (impactBase - 0.029) - 3.25 * Math.pow(impactBase - 0.02, 15);
    }

    // Exploitability subscore
    const attackVector = this.BASE_METRIC_VALUES.attackVector[vector.attackVector];
    const attackComplexity = this.BASE_METRIC_VALUES.attackComplexity[vector.attackComplexity];
    
    const privilegesRequired = vector.scope === 'C' 
      ? this.BASE_METRIC_VALUES.privilegesRequired.changed[vector.privilegesRequired]
      : this.BASE_METRIC_VALUES.privilegesRequired.unchanged[vector.privilegesRequired];
    
    const userInteraction = this.BASE_METRIC_VALUES.userInteraction[vector.userInteraction];
    
    const exploitabilityScore = 8.22 * attackVector * attackComplexity * privilegesRequired * userInteraction;

    return {
      impactScore: Math.max(0, impactScore),
      exploitabilityScore
    };
  }

  private static calculateTemporalScore(baseScore: number, vector: ICVSSv3Vector): number {
    const exploitCodeMaturity = this.TEMPORAL_METRIC_VALUES.exploitCodeMaturity[vector.exploitCodeMaturity || 'X'];
    const remediationLevel = this.TEMPORAL_METRIC_VALUES.remediationLevel[vector.remediationLevel || 'X'];
    const reportConfidence = this.TEMPORAL_METRIC_VALUES.reportConfidence[vector.reportConfidence || 'X'];

    const temporalScore = baseScore * exploitCodeMaturity * remediationLevel * reportConfidence;
    return Math.ceil(temporalScore * 10) / 10;
  }

  private static calculateEnvironmentalScore(vector: ICVSSv3Vector): number {
    // This is a simplified environmental score calculation
    // Full implementation would require modified impact and exploitability calculations
    const baseScore = this.calculateBaseScore(vector);
    
    const cr = this.ENVIRONMENTAL_METRIC_VALUES.confidentialityRequirement[vector.confidentialityRequirement || 'X'];
    const ir = this.ENVIRONMENTAL_METRIC_VALUES.integrityRequirement[vector.integrityRequirement || 'X'];
    const ar = this.ENVIRONMENTAL_METRIC_VALUES.availabilityRequirement[vector.availabilityRequirement || 'X'];
    
    const envMultiplier = Math.min((cr + ir + ar) / 3, 1.5);
    const environmentalScore = baseScore * envMultiplier;
    
    return Math.ceil(environmentalScore * 10) / 10;
  }

  private static hasEnvironmentalMetrics(vector: ICVSSv3Vector): boolean {
    return !!(vector.confidentialityRequirement || vector.integrityRequirement || 
             vector.availabilityRequirement || vector.modifiedAttackVector ||
             vector.modifiedAttackComplexity || vector.modifiedPrivilegesRequired ||
             vector.modifiedUserInteraction || vector.modifiedScope ||
             vector.modifiedConfidentialityImpact || vector.modifiedIntegrityImpact ||
             vector.modifiedAvailabilityImpact);
  }

  private static getSeverityRating(score: number): 'None' | 'Low' | 'Medium' | 'High' | 'Critical' {
    if (score === 0) return 'None';
    if (score >= 0.1 && score <= 3.9) return 'Low';
    if (score >= 4.0 && score <= 6.9) return 'Medium';
    if (score >= 7.0 && score <= 8.9) return 'High';
    if (score >= 9.0 && score <= 10.0) return 'Critical';
    return 'None';
  }

  private static generateVectorString(vector: ICVSSv3Vector): string {
    let vectorString = 'CVSS:3.1/';
    vectorString += `AV:${vector.attackVector}`;
    vectorString += `/AC:${vector.attackComplexity}`;
    vectorString += `/PR:${vector.privilegesRequired}`;
    vectorString += `/UI:${vector.userInteraction}`;
    vectorString += `/S:${vector.scope}`;
    vectorString += `/C:${vector.confidentialityImpact}`;
    vectorString += `/I:${vector.integrityImpact}`;
    vectorString += `/A:${vector.availabilityImpact}`;

    // Add temporal metrics if present
    if (vector.exploitCodeMaturity && vector.exploitCodeMaturity !== 'X') {
      vectorString += `/E:${vector.exploitCodeMaturity}`;
    }
    if (vector.remediationLevel && vector.remediationLevel !== 'X') {
      vectorString += `/RL:${vector.remediationLevel}`;
    }
    if (vector.reportConfidence && vector.reportConfidence !== 'X') {
      vectorString += `/RC:${vector.reportConfidence}`;
    }

    // Add environmental metrics if present
    if (vector.confidentialityRequirement && vector.confidentialityRequirement !== 'X') {
      vectorString += `/CR:${vector.confidentialityRequirement}`;
    }
    if (vector.integrityRequirement && vector.integrityRequirement !== 'X') {
      vectorString += `/IR:${vector.integrityRequirement}`;
    }
    if (vector.availabilityRequirement && vector.availabilityRequirement !== 'X') {
      vectorString += `/AR:${vector.availabilityRequirement}`;
    }

    return vectorString;
  }
}

export class RiskAssessmentEngine {
  /**
   * Perform comprehensive risk assessment for a CVE
   */
  public static assessRisk(
    cvssScore: ICVSSScore,
    threatContext: Partial<IRiskAssessment['threatContext']>,
    assetContext: Partial<IRiskAssessment['assetContext']>,
    organizationContext?: {
      industry: string;
      size: 'Small' | 'Medium' | 'Large' | 'Enterprise';
      riskTolerance: 'Low' | 'Medium' | 'High';
    }
  ): IRiskAssessment {
    
    // Calculate base risk from CVSS
    let riskScore = cvssScore.overallScore * 10; // Scale to 0-100

    // Adjust for threat context
    if (threatContext.exploitAvailability) {
      riskScore += 15;
    }
    if (threatContext.inWildExploitation) {
      riskScore += 20;
    }
    if (threatContext.threatActorInterest && threatContext.threatActorInterest > 70) {
      riskScore += 10;
    }

    // Adjust for asset context
    const assetMultipliers = {
      Critical: 1.5,
      High: 1.2,
      Medium: 1.0,
      Low: 0.8
    };
    riskScore *= assetMultipliers[assetContext.criticality || 'Medium'];

    // Exposure adjustments
    if (assetContext.exposure === 'Internet') {
      riskScore += 15;
    } else if (assetContext.exposure === 'Internal') {
      riskScore += 5;
    }

    // Cap at 100
    riskScore = Math.min(riskScore, 100);

    const riskLevel = this.getRiskLevel(riskScore);
    const businessImpact = this.calculateBusinessImpact(riskScore, assetContext, organizationContext);
    const remediationGuidance = this.generateRemediationGuidance(riskScore, cvssScore, threatContext);

    return {
      riskScore,
      riskLevel,
      businessImpact,
      threatContext: {
        exploitAvailability: threatContext.exploitAvailability || false,
        exploitComplexity: threatContext.exploitComplexity || 'Medium',
        threatActorInterest: threatContext.threatActorInterest || 0,
        inWildExploitation: threatContext.inWildExploitation || false
      },
      assetContext: {
        criticality: assetContext.criticality || 'Medium',
        exposure: assetContext.exposure || 'Internal',
        dataClassification: assetContext.dataClassification || 'Internal'
      },
      remediationGuidance
    };
  }

  private static getRiskLevel(riskScore: number): IRiskAssessment['riskLevel'] {
    if (riskScore >= 90) return 'Critical';
    if (riskScore >= 70) return 'High';
    if (riskScore >= 40) return 'Medium';
    if (riskScore >= 20) return 'Low';
    return 'Minimal';
  }

  private static calculateBusinessImpact(
    riskScore: number,
    assetContext: Partial<IRiskAssessment['assetContext']>,
    organizationContext?: {
      industry: string;
      size: 'Small' | 'Medium' | 'Large' | 'Enterprise';
      riskTolerance: 'Low' | 'Medium' | 'High';
    }
  ): IRiskAssessment['businessImpact'] {
    
    const baseImpact = riskScore / 100;
    
    // Industry multipliers
    const industryMultipliers: { [key: string]: number } = {
      'financial': 1.5,
      'healthcare': 1.4,
      'government': 1.3,
      'technology': 1.2,
      'manufacturing': 1.0,
      'retail': 1.1
    };
    
    const industryMultiplier = organizationContext?.industry 
      ? industryMultipliers[organizationContext.industry.toLowerCase()] || 1.0
      : 1.0;

    // Size multipliers
    const sizeMultipliers = {
      'Small': 0.8,
      'Medium': 1.0,
      'Large': 1.2,
      'Enterprise': 1.5
    };
    
    const sizeMultiplier = organizationContext?.size 
      ? sizeMultipliers[organizationContext.size]
      : 1.0;

    const totalMultiplier = industryMultiplier * sizeMultiplier;

    return {
      financial: Math.min(baseImpact * totalMultiplier * 100, 100),
      operational: Math.min(baseImpact * 0.8 * totalMultiplier * 100, 100),
      reputational: Math.min(baseImpact * 0.9 * totalMultiplier * 100, 100),
      compliance: Math.min(baseImpact * 1.1 * totalMultiplier * 100, 100)
    };
  }

  private static generateRemediationGuidance(
    riskScore: number,
    cvssScore: ICVSSScore,
    threatContext: Partial<IRiskAssessment['threatContext']>
  ): IRiskAssessment['remediationGuidance'] {
    
    let priority: IRiskAssessment['remediationGuidance']['priority'];
    let timeframe: string;
    let complexity: 'Low' | 'Medium' | 'High';
    const recommendations: string[] = [];

    // Determine priority and timeframe
    if (riskScore >= 90) {
      priority = 'P0';
      timeframe = 'Immediate (0-24 hours)';
    } else if (riskScore >= 70) {
      priority = 'P1';
      timeframe = 'Urgent (24-72 hours)';
    } else if (riskScore >= 40) {
      priority = 'P2';
      timeframe = 'High (1-2 weeks)';
    } else if (riskScore >= 20) {
      priority = 'P3';
      timeframe = 'Medium (2-4 weeks)';
    } else {
      priority = 'P4';
      timeframe = 'Low (1-3 months)';
    }

    // Determine complexity
    if (cvssScore.baseSeverity === 'Critical' || threatContext.inWildExploitation) {
      complexity = 'High';
      recommendations.push('Coordinate with security team and stakeholders');
      recommendations.push('Consider emergency change process');
    } else if (cvssScore.baseSeverity === 'High') {
      complexity = 'Medium';
      recommendations.push('Follow standard change management process');
    } else {
      complexity = 'Low';
      recommendations.push('Schedule during next maintenance window');
    }

    // Add specific recommendations
    if (threatContext.exploitAvailability) {
      recommendations.push('Exploit code is available - prioritize patching');
    }
    if (threatContext.inWildExploitation) {
      recommendations.push('Active exploitation detected - implement immediate mitigations');
    }
    if (cvssScore.vectorString.includes('AV:N')) {
      recommendations.push('Network accessible vulnerability - consider network controls');
    }
    if (cvssScore.vectorString.includes('PR:N')) {
      recommendations.push('No privileges required - high priority for patching');
    }

    recommendations.push('Test patches in non-production environment first');
    recommendations.push('Prepare rollback plan before deployment');
    recommendations.push('Monitor for exploitation attempts');

    return {
      priority,
      timeframe,
      complexity,
      recommendations
    };
  }
}

// Example usage and utility functions
export const CVSSExamples = {
  /**
   * Example CVSS vectors for common vulnerability types
   */
  remoteCodeExecution: {
    attackVector: 'N' as const,
    attackComplexity: 'L' as const,
    privilegesRequired: 'N' as const,
    userInteraction: 'N' as const,
    scope: 'C' as const,
    confidentialityImpact: 'H' as const,
    integrityImpact: 'H' as const,
    availabilityImpact: 'H' as const
  },
  
  privilegeEscalation: {
    attackVector: 'L' as const,
    attackComplexity: 'L' as const,
    privilegesRequired: 'L' as const,
    userInteraction: 'N' as const,
    scope: 'U' as const,
    confidentialityImpact: 'H' as const,
    integrityImpact: 'H' as const,
    availabilityImpact: 'H' as const
  },
  
  informationDisclosure: {
    attackVector: 'N' as const,
    attackComplexity: 'L' as const,
    privilegesRequired: 'N' as const,
    userInteraction: 'N' as const,
    scope: 'U' as const,
    confidentialityImpact: 'H' as const,
    integrityImpact: 'N' as const,
    availabilityImpact: 'N' as const
  },
  
  denialOfService: {
    attackVector: 'N' as const,
    attackComplexity: 'L' as const,
    privilegesRequired: 'N' as const,
    userInteraction: 'N' as const,
    scope: 'U' as const,
    confidentialityImpact: 'N' as const,
    integrityImpact: 'N' as const,
    availabilityImpact: 'H' as const
  }
};