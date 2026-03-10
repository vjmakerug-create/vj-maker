import { Facebook, Twitter, Instagram, Youtube } from "lucide-react";

const Footer = () => {
  const footerLinks = {
    Languages: ["Luo", "Luganda", "Teso", "Lunyankole", "Kumam", "Lugwara", "Jopathola", "Kiswahili"],
    VJs: ["VJ Piles UG", "VJ Confidential", "VJ Adamson", "VJ Dimpoz"],
    "More VJs": ["VJ Ice P", "VJ Junior", "VJ Emmy", "VJ Jingo"],
    Account: ["My Account", "Subscription", "Settings", "Help"],
  };

  const allVJs = [
    "VJ Piles UG", "VJ Confidential", "VJ Adamson", "VJ Dimpoz", "VJ Ice P", 
    "VJ Junior", "VJ Emmy", "VJ Jingo", "VJ Mark", "VJ Kevo", "VJ Simon",
    "VJ Omutibwa", "VJ Muwonge", "VJ Musoke", "VJ Wasswa", "VJ Kato",
    "VJ Nakato", "VJ Babirye", "VJ Ssempijja", "VJ Mukasa", "VJ Nsubuga",
    "VJ Brian", "VJ Emma", "VJ Sharif", "VJ Smart", "VJ Crazy",
    "VJ Kasuku", "VJ Kintu", "VJ Ssebunya", "VJ Katumba", "VJ Nambi"
  ];

  return (
    <footer className="bg-card border-t border-border mt-16">
      <div className="container mx-auto px-4 lg:px-8 py-12 lg:py-16">
        {/* VJs Section */}
        <div className="mb-12">
          <h3 className="text-lg font-bold text-foreground mb-4">Our VJs (Video Jockeys)</h3>
          <div className="flex flex-wrap gap-2">
            {allVJs.map((vj) => (
              <span
                key={vj}
                className="px-3 py-1 bg-secondary text-sm text-muted-foreground rounded-full hover:bg-primary hover:text-white transition-colors cursor-pointer"
              >
                {vj}
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Logo & Description */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1 mb-8 lg:mb-0">
            <a href="#" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <span className="text-white font-display font-bold text-xl">L</span>
              </div>
              <span className="font-display font-bold text-xl text-foreground">
                LUO FILM
              </span>
            </a>
            <p className="text-muted-foreground text-sm mb-6">
              Watch Ugandan translated movies in Luo, Luganda, Teso, Lunyankole, Kumam, Lugwara, Jopathola, English and Kiswahili. Both local and international movies!
            </p>
            
            {/* Social Links */}
            <div className="flex items-center gap-4">
              {[Facebook, Twitter, Instagram, Youtube].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-semibold text-foreground mb-4">{title}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © 2024 LUO FILM. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">
              Terms
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;