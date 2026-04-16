import Types "../types";
import GenerationsLib "../lib/generations";
import UsersLib "../lib/users";
import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Text "mo:core/Text";
import Time "mo:core/Time";

mixin (
  generations : Map.Map<Text, Types.Generation>,
  profiles : Map.Map<Text, Types.UserProfile>,
  genCounter : { var value : Nat },
) {
  public query func getTotalGenerations() : async Nat {
    GenerationsLib.countAll(generations)
  };

  public query func getActiveUsers() : async Nat {
    GenerationsLib.countActiveUsers(profiles)
  };

  public query func getGenerationHistory(userId : Principal, limit : Nat) : async [Types.Generation] {
    GenerationsLib.listForUser(generations, userId, limit)
  };

  public query func getUserProfile(userId : Principal) : async ?Types.UserProfile {
    profiles.get(userId.toText())
  };

  public func saveGeneration(
    userId : Principal,
    genType : Types.GenerationType,
    prompt : Text,
    title : Text,
  ) : async Text {
    let now = Time.now();
    genCounter.value += 1;
    let id = GenerationsLib.newId(genCounter.value, now);
    let gen : Types.Generation = {
      id;
      userId;
      type_ = genType;
      prompt;
      title;
      createdAt = now;
    };
    generations.add(id, gen);
    UsersLib.incrementGenerations(profiles, userId, now);
    id
  };

  public func updateUserProfile(principal : Principal, displayName : Text) : async Bool {
    let key = principal.toText();
    let now = Time.now();
    let existing = UsersLib.getOrCreate(profiles, principal, now);
    profiles.add(key, { existing with displayName });
    true
  };

  public func deleteGeneration(userId : Principal, genId : Text) : async Bool {
    switch (generations.get(genId)) {
      case (?gen) {
        if (Principal.equal(gen.userId, userId)) {
          generations.remove(genId);
          // Decrement user counter if > 0
          let key = userId.toText();
          switch (profiles.get(key)) {
            case (?p) {
              if (p.totalGenerations > 0) {
                profiles.add(
                  key,
                  { p with totalGenerations = p.totalGenerations - 1 },
                );
              };
            };
            case null {};
          };
          true
        } else false
      };
      case null false;
    }
  };
};
