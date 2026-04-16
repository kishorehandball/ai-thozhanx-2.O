import Types "types";
import GenerationsApi "mixins/generations-api";
import Map "mo:core/Map";

actor {
  let generations = Map.empty<Text, Types.Generation>();
  let profiles = Map.empty<Text, Types.UserProfile>();
  let genCounter = { var value : Nat = 0 };

  include GenerationsApi(generations, profiles, genCounter);
};
