{ pkgs ? import <nixpkgs> {} }: 

pkgs.mkShell
{
    nativeBuildInputs = with pkgs; [
        nodePackages.pnpm
    ];
    shellHook = ''
    export IN_NIX_SHELL=1
    export NIX_SHELL_TEXT="Nix Dare"
    '';
}  

# lauch shell with ```nix-shell --command zsh```