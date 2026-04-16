import Types "../types";
import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Text "mo:core/Text";

module {
  public func getOrCreate(
    profiles : Map.Map<Text, Types.UserProfile>,
    userId : Principal,
    now : Int,
  ) : Types.UserProfile {
    let key = userId.toText();
    switch (profiles.get(key)) {
      case (?p) p;
      case null {
        let newProfile : Types.UserProfile = {
          principal = userId;
          displayName = "";
          totalGenerations = 0;
          joinedAt = now;
        };
        profiles.add(key, newProfile);
        newProfile;
      };
    };
  };

  public func incrementGenerations(
    profiles : Map.Map<Text, Types.UserProfile>,
    userId : Principal,
    now : Int,
  ) {
    let key = userId.toText();
    let existing = getOrCreate(profiles, userId, now);
    profiles.add(
      key,
      { existing with totalGenerations = existing.totalGenerations + 1 },
    );
  };
};
