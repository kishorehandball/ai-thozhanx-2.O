module {
  public type GenerationType = {
    #Chat;
    #Image;
    #Video;
    #Website;
    #Document;
    #PPT;
    #PDF;
    #Abstract;
    #Project;
  };

  public type Generation = {
    id : Text;
    userId : Principal;
    type_ : GenerationType;
    prompt : Text;
    title : Text;
    createdAt : Int;
  };

  public type UserProfile = {
    principal : Principal;
    displayName : Text;
    totalGenerations : Nat;
    joinedAt : Int;
  };
};
