import { CalculationMethod, CalculationParameters, Madhab } from "adhan";
import type { CalculationMethodKey, AsrMethodKey } from "../../types/prayer";

/**
 * Returns adhan-js CalculationParameters for the given method key.
 * "Kemenag" is not built into adhan-js, so we approximate it using
 * MoonsightingCommittee with a custom Fajr angle of 20°.
 */
export function getCalculationMethod(
  key: CalculationMethodKey,
): CalculationParameters {
  switch (key) {
    case "MoonsightingCommittee":
      return CalculationMethod.MoonsightingCommittee();

    case "Kemenag": {
      const params = CalculationMethod.MoonsightingCommittee();
      params.fajrAngle = 20;
      return params;
    }

    case "MuslimWorldLeague":
      return CalculationMethod.MuslimWorldLeague();

    case "ISNA":
      return CalculationMethod.NorthAmerica();

    default: {
      const _exhaustive: never = key;
      console.warn(
        `Unknown calculation method: ${_exhaustive}, falling back to MoonsightingCommittee`,
      );
      return CalculationMethod.MoonsightingCommittee();
    }
  }
}

type MadhabValue = (typeof Madhab)[keyof typeof Madhab];

/**
 * Returns the adhan-js Madhab value for the given Asr method key.
 * Shafi → Madhab.Shafi (shadow length 1x)
 * Hanafi → Madhab.Hanafi (shadow length 2x)
 */
export function getAsrMethod(key: AsrMethodKey): MadhabValue {
  switch (key) {
    case "Shafi":
      return Madhab.Shafi;
    case "Hanafi":
      return Madhab.Hanafi;
    default: {
      const _exhaustive: never = key;
      console.warn(`Unknown Asr method: ${_exhaustive}, falling back to Shafi`);
      return Madhab.Shafi;
    }
  }
}
