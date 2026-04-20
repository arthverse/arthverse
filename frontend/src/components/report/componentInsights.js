/**
 * Generates personalized plain-language "Ideal vs Actual" insights
 * for each of the 10 scoring components.
 * Each component returns { isGood, message } based on user's actual data.
 */
export function generateComponentInsight(componentName, details, data) {
  const { income, expenses, savings, emergencyFund, totalAssets, totalLiabilities, netWorth, mutualFunds, stocks, pfNps, fd, gold, realEstate, formatINR, formatINR2 } = data;
  const pct = details?.percentage ?? 0;
  const isGood = pct >= 60;

  switch (componentName) {
    case 'Savings Rate': {
      const actualSavings = savings;
      const targetSavings = Math.round(income * 0.30);
      const gap = targetSavings - actualSavings;
      if (isGood) {
        return {
          isGood: true,
          message: `You're saving well every month — you're putting aside ${formatINR(actualSavings)} regularly. For your income level, saving around ${formatINR(targetSavings)} is considered strong. ${gap <= 0 ? "You've exceeded the ideal!" : "You're very close to the ideal."}`,
          actual: formatINR(actualSavings) + '/mo',
          ideal: formatINR(targetSavings) + '/mo',
        };
      }
      const monthsToClose = gap > 0 && actualSavings > 0 ? Math.ceil(gap / 2000) : 0;
      return {
        isGood: false,
        message: `You're saving ${formatINR(gap)} less than what would be comfortable for your future needs.${monthsToClose > 0 ? ` If you increase savings by ₹2,000 per month, you can close this gap in about ${monthsToClose} months.` : ' Start by setting aside even a small amount regularly.'}`,
        actual: formatINR(actualSavings) + '/mo',
        ideal: formatINR(targetSavings) + '/mo',
      };
    }

    case 'EMI Tolerance': {
      const totalEMI = details?.total_emi ?? details?.actual_emi ?? 0;
      const maxSafeEMI = Math.round(income * 0.40);
      if (isGood) {
        return {
          isGood: true,
          message: `Your loan payments are under control — your EMIs (${formatINR(totalEMI)}) fit comfortably within your income. You're not under pressure from loans, which is a very good position to be in.`,
          actual: formatINR(totalEMI) + '/mo',
          ideal: '< ' + formatINR(maxSafeEMI) + '/mo',
        };
      }
      return {
        isGood: false,
        message: `Your EMI payments (${formatINR(totalEMI)}) are higher than what your income can comfortably support (${formatINR(maxSafeEMI)}). Reducing one loan or refinancing could lower your monthly pressure and make your finances safer.`,
        actual: formatINR(totalEMI) + '/mo',
        ideal: '< ' + formatINR(maxSafeEMI) + '/mo',
      };
    }

    case 'Emergency Fund': {
      const monthsCovered = expenses > 0 ? (emergencyFund / expenses).toFixed(1) : 0;
      const targetMonths = 6;
      const targetAmount = expenses * targetMonths;
      const gap = targetAmount - emergencyFund;
      if (isGood) {
        return {
          isGood: true,
          message: `Your emergency fund is healthy — you have about ${monthsCovered} months of expenses saved (${formatINR2(emergencyFund)}). Ideally, families should have around ${targetMonths} months. ${gap <= 0 ? "You've exceeded the target!" : "You're very close to the safe zone."}`,
          actual: formatINR2(emergencyFund) + ` (${monthsCovered} months)`,
          ideal: formatINR2(targetAmount) + ` (${targetMonths} months)`,
        };
      }
      const monthsToBuild = gap > 0 && savings > 0 ? Math.ceil(gap / savings) : 0;
      return {
        isGood: false,
        message: `You need about ${formatINR2(gap)} more in your emergency fund to feel financially safe.${monthsToBuild > 0 ? ` At your current savings rate, you can build this in about ${monthsToBuild} months.` : ' Start by redirecting a portion of monthly savings here.'}`,
        actual: formatINR2(emergencyFund) + ` (${monthsCovered} months)`,
        ideal: formatINR2(targetAmount) + ` (${targetMonths} months)`,
      };
    }

    case 'Investment Portfolio': {
      const totalInvestments = mutualFunds + stocks + pfNps;
      const targetInvestments = income * 12 * 2.5;
      if (isGood) {
        return {
          isGood: true,
          message: `You're investing regularly and the amount you've built (${formatINR2(totalInvestments)}) is strong for your stage of life. This habit will help you build long-term wealth steadily.`,
          actual: formatINR2(totalInvestments),
          ideal: formatINR2(targetInvestments) + ' (2.5x annual income)',
        };
      }
      return {
        isGood: false,
        message: `Your investment value (${formatINR2(totalInvestments)}) is lower than expected for your income. Increasing investments by even ₹2,000 per month can significantly improve your future financial strength.`,
        actual: formatINR2(totalInvestments),
        ideal: formatINR2(targetInvestments) + ' (2.5x annual income)',
      };
    }

    case 'Net Worth': {
      const targetNetWorth = income * 12 * 3;
      if (isGood) {
        return {
          isGood: true,
          message: `Your total assets (${formatINR2(totalAssets)}) are comfortably higher than your loans (${formatINR2(totalLiabilities)}). Your net worth of ${formatINR2(netWorth)} means your overall financial position is strong and stable.`,
          actual: formatINR2(netWorth),
          ideal: formatINR2(targetNetWorth) + ' (3x annual income)',
        };
      }
      return {
        isGood: false,
        message: `Your loans (${formatINR2(totalLiabilities)}) are eating into your assets more than they should. Reducing debt or increasing savings will help strengthen your overall net worth of ${formatINR2(netWorth)}.`,
        actual: formatINR2(netWorth),
        ideal: formatINR2(targetNetWorth) + ' (3x annual income)',
      };
    }

    case 'Asset Allocation': {
      // Use backend-calculated ideal allocation if available
      const alloc = details?.allocation_by_class || {};
      const idealAlloc = details?.ideal_allocation || {};
      const equityPct = alloc.equity?.actual?.toFixed(0) ?? (totalAssets > 0 ? ((mutualFunds + stocks) / totalAssets * 100).toFixed(0) : 0);
      const debtPct = alloc.debt?.actual?.toFixed(0) ?? (totalAssets > 0 ? ((fd + pfNps) / totalAssets * 100).toFixed(0) : 0);
      const goldPct = alloc.metals?.actual?.toFixed(0) ?? (totalAssets > 0 ? (gold / totalAssets * 100).toFixed(0) : 0);
      const rePct = alloc.real_estate?.actual?.toFixed(0) ?? (totalAssets > 0 ? (realEstate / totalAssets * 100).toFixed(0) : 0);
      const idealEq = idealAlloc.equity ?? 43;
      const idealDt = idealAlloc.debt ?? 22;
      const idealGd = idealAlloc.metals ?? 8;
      const idealRe = idealAlloc.real_estate ?? 27;
      if (isGood) {
        return {
          isGood: true,
          message: `Your money is spread wisely — Equity ${equityPct}%, Debt ${debtPct}%, Real Estate ${rePct}%, Metals ${goldPct}%. This balance helps reduce risk and improves long-term growth.`,
          actual: `Eq ${equityPct}% | Debt ${debtPct}% | RE ${rePct}% | Metals ${goldPct}%`,
          ideal: `Eq ${idealEq}% | Debt ${idealDt}% | RE ${idealRe}% | Metals ${idealGd}%`,
        };
      }
      return {
        isGood: false,
        message: `Your allocation is imbalanced — Equity ${equityPct}% (ideal ${idealEq}%), Debt ${debtPct}% (ideal ${idealDt}%), Real Estate ${rePct}% (ideal ${idealRe}%), Metals ${goldPct}% (ideal ${idealGd}%). Rebalancing can protect your wealth and improve returns.`,
        actual: `Eq ${equityPct}% | Debt ${debtPct}% | RE ${rePct}% | Metals ${goldPct}%`,
        ideal: `Eq ${idealEq}% | Debt ${idealDt}% | RE ${idealRe}% | Metals ${idealGd}%`,
      };
    }

    case 'Financial Habits': {
      if (isGood) {
        return {
          isGood: true,
          message: 'You follow strong financial habits — like saving regularly, filing ITR on time, and avoiding unnecessary debt. These habits are the backbone of financial success.',
          actual: `Score: ${Math.round(pct)}%`,
          ideal: '80%+ for all 7 checkpoints',
        };
      }
      return {
        isGood: false,
        message: 'Some key financial habits are missing — like personal insurance, regular ITR filing, or investing beyond FD. Improving these habits can make a big difference in your financial health.',
        actual: `Score: ${Math.round(pct)}%`,
        ideal: '80%+ for all 7 checkpoints',
      };
    }

    case 'Life Insurance': {
      const actualCover = details?.actual_cover ?? 0;
      const idealCover = income * 12 * 15;
      if (isGood) {
        return {
          isGood: true,
          message: `Your life insurance cover (${formatINR2(actualCover)}) is strong enough to protect your family's future if something unexpected happens. This gives your family financial safety.`,
          actual: formatINR2(actualCover),
          ideal: formatINR2(idealCover) + ' (15x annual income)',
        };
      }
      return {
        isGood: false,
        message: `Your life insurance cover (${formatINR2(actualCover)}) is lower than what your family may need (${formatINR2(idealCover)}). Increasing coverage can protect your family's lifestyle and future expenses.`,
        actual: formatINR2(actualCover),
        ideal: formatINR2(idealCover) + ' (15x annual income)',
      };
    }

    case 'Health Insurance': {
      const actualCover = details?.actual_cover ?? 0;
      const idealCover = 1000000;
      if (isGood) {
        return {
          isGood: true,
          message: `Your health insurance coverage (${formatINR2(actualCover)}) looks adequate for your family size. This reduces the risk of large medical bills affecting your savings.`,
          actual: formatINR2(actualCover),
          ideal: formatINR2(idealCover) + '+',
        };
      }
      return {
        isGood: false,
        message: `Your health insurance coverage (${formatINR2(actualCover)}) may not be enough for major medical expenses. Increasing coverage to at least ${formatINR2(idealCover)} can protect your savings from hospital costs.`,
        actual: formatINR2(actualCover),
        ideal: formatINR2(idealCover) + '+',
      };
    }

    case 'Vehicle Insurance': {
      if (isGood) {
        return {
          isGood: true,
          message: 'Your vehicle insurance coverage is appropriate (comprehensive), which protects you from unexpected repair or accident costs.',
          actual: 'Comprehensive',
          ideal: 'Comprehensive (OD + TP)',
        };
      }
      return {
        isGood: false,
        message: 'Your vehicle insurance coverage appears lower than recommended. Updating to a comprehensive policy can prevent sudden financial losses after an accident.',
        actual: details?.type || 'Third-party / None',
        ideal: 'Comprehensive (OD + TP)',
      };
    }

    default:
      return { isGood: pct >= 60, message: '', actual: '-', ideal: '-' };
  }
}
